import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

// Geçiş değerleri: PDKS standart ID'leri (DeviceYetki.TimezoneId alanına yazılır)
const DEFAULT_GECIS_OPTIONS = [
    { id: 1, timeZoneName: 'Yetkili' },
    { id: 999999999, timeZoneName: 'Yasaklı' },
];

export default function TerminalGrubuIndex() {
    const [loading, setLoading] = useState(true);
    const [terminalGrupList, setTerminalGrupList] = useState([]);
    const [yetkiList, setYetkiList] = useState([]);
    const [gecisOptions] = useState(DEFAULT_GECIS_OPTIONS);
    const [selectedGrup, setSelectedGrup] = useState(null);
    const [selectedYetki, setSelectedYetki] = useState(null);
    const [terminalRows, setTerminalRows] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const yukleBaslangic = async () => {
        const [gruplarRes, yetkiRes] = await Promise.all([
            GetWithToken('TerminalGroup/GetAll', { PageNumber: 1, PageSize: 500 }).catch(() => ({ data: { data: { list: [] } } })),
            GetWithToken('Yetki/GetAll').catch(() => ({ data: { data: [] } })),
        ]);
        setTerminalGrupList((gruplarRes.data?.data?.list || []).map((m) => ({ id: m.id, ad: m.ad || m.Ad })));
        setYetkiList((yetkiRes.data?.data || []).map((m) => ({ id: m.id, aciklama: m.aciklama || m.Aciklama })));
    };

    const terminalYetkileriYukle = async (grupId, yetkiId) => {
        const res = await GetWithToken('DeviceYetki/GetByTerminalGroupAndYetki', {
            terminalGrubuId: grupId,
            yetkiId,
        });
        const rows = (res?.data?.data || []).map((r) => ({
            terminalId: r.terminalId,
            terminalName: r.terminalName,
            timezoneId: r.timezoneId ?? r.TimezoneId ?? null,
        }));
        setTerminalRows(rows);
    };

    useEffect(() => {
        yukleBaslangic().then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedGrup?.id && selectedYetki?.id) {
            terminalYetkileriYukle(selectedGrup.id, selectedYetki.id);
        } else {
            setTerminalRows([]);
        }
    }, [selectedGrup?.id, selectedYetki?.id]);

    const timezoneDegistir = (terminalId, timezoneId) => {
        setTerminalRows((prev) =>
            prev.map((r) =>
                r.terminalId === terminalId ? { ...r, timezoneId: timezoneId === '' ? null : parseInt(timezoneId, 10) } : r
            )
        );
    };

    const guncelle = async () => {
        if (!selectedGrup?.id || !selectedYetki?.id) {
            AlertFunction('Uyarı', 'Terminal grubu ve yetki seçiniz.');
            return;
        }
        setIsUpdating(true);
        try {
            const items = terminalRows.map((r) => ({
                terminalId: r.terminalId,
                timezoneId: r.timezoneId,
            }));
            const res = await PostWithToken('DeviceYetki/BatchUpdate', {
                terminalGrubuId: selectedGrup.id,
                yetkiId: selectedYetki.id,
                items,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            AlertFunction('Başarılı', 'Geçiş yetkileri güncellendi.');
            terminalYetkileriYukle(selectedGrup.id, selectedYetki.id);
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setIsUpdating(false);
        }
    };

    const cihazaGonder = async () => {
        if (!selectedGrup?.id || !selectedYetki?.id) {
            AlertFunction('Uyarı', 'Terminal grubu ve yetki seçiniz.');
            return;
        }
        setIsSending(true);
        try {
            const res = await PostWithToken('DeviceYetki/SendToDevice', {
                terminalGrubuId: selectedGrup.id,
                yetkiId: selectedYetki.id,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            AlertFunction('Başarılı', res.data.message || 'Cihaza gönderim tamamlandı.');
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {loading && <PageLoading />}
            <Layout>
                <PageHeader
                    title="Geçiş Grubu"
                    map={[
                        { url: 'terminal', name: 'Terminal' },
                        { url: 'terminal/terminal-grubu', name: 'Geçiş Grubu' },
                    ]}
                />
                <div className="content pr-3 pl-3">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Geçiş Yetkisi Tanımlama</h6>
                            <small className="text-muted">
                                Terminal grubu ve yetki seçerek, gruba ait terminallerin geçiş değerlerini ayarlayın.
                            </small>
                        </div>
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">Terminal Grubu</label>
                                    <select
                                        className="form-control"
                                        value={selectedGrup?.id ?? ''}
                                        onChange={(e) => {
                                            const id = e.target.value ? parseInt(e.target.value, 10) : null;
                                            setSelectedGrup(id ? terminalGrupList.find((g) => g.id === id) || { id, ad: '' } : null);
                                        }}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {terminalGrupList.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.ad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Yetki</label>
                                    <select
                                        className="form-control"
                                        value={selectedYetki?.id ?? ''}
                                        onChange={(e) => {
                                            const id = e.target.value ? parseInt(e.target.value, 10) : null;
                                            setSelectedYetki(id ? yetkiList.find((y) => y.id === id) || { id, aciklama: '' } : null);
                                        }}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {yetkiList.map((y) => (
                                            <option key={y.id} value={y.id}>
                                                {y.aciklama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 d-flex align-items-end gap-2">
                                    <DebisButton onClick={guncelle} disabled={terminalRows.length === 0 || isUpdating}>
                                        <i className="fa fa-save mr-1" /> Güncelle
                                    </DebisButton>
                                    <DebisButton
                                        onClick={cihazaGonder}
                                        disabled={terminalRows.length === 0 || isSending}
                                        yellow
                                    >
                                        <i className="fa fa-cloud-upload mr-1" /> Cihaza Gönder
                                    </DebisButton>
                                </div>
                            </div>

                            {selectedGrup && selectedYetki && (
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Terminal</th>
                                                <th style={{ minWidth: 180 }}>Geçiş Değeri</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {terminalRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="text-muted text-center py-4">
                                                        Bu gruba tanımlı terminal bulunamadı. Önce Terminal Yetki Tanımlama sayfasından terminalleri gruba ekleyin.
                                                    </td>
                                                </tr>
                                            ) : (
                                                terminalRows.map((row) => (
                                                    <tr key={row.terminalId}>
                                                        <td>{row.terminalName}</td>
                                                        <td>
                                                            <select
                                                                className="form-control form-control-sm"
                                                                value={row.timezoneId ?? ''}
                                                                onChange={(e) => timezoneDegistir(row.terminalId, e.target.value)}
                                                            >
                                                                <option value="">-----</option>
                                                                {gecisOptions.map((opt) => {
                                                                    const val = opt.id ?? opt.Id;
                                                                    const label = opt.timeZoneName || opt.TimeZoneName || '-----';
                                                                    return (
                                                                        <option key={val} value={val}>
                                                                            {label}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {(!selectedGrup || !selectedYetki) && (
                                <p className="text-muted mb-0">
                                    <i className="fa fa-info-circle mr-2" />
                                    Terminal grubu ve yetki seçerek terminallerin geçiş değerlerini görüntüleyip güncelleyebilirsiniz.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
