import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';

const formatTarihSaat = (val) => {
    if (!val) return '-';
    try {
        return new Date(val).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return val;
    }
};

export default function TerminalKayitlariIndex() {
    const [raporTarih, setRaporTarih] = useState(() => new Date().toISOString().split('T')[0]);

    const [sicilList, setSicilList] = useState([]);
    const [selectedSicilIds, setSelectedSicilIds] = useState(new Set());
    const [sicilLoading, setSicilLoading] = useState(false);

    const [terminalKayitlari, setTerminalKayitlari] = useState([]);
    const [veriSicilId, setVeriSicilId] = useState(null);
    const [veriLoading, setVeriLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadSicilList();
    }, []);

    const loadSicilList = async () => {
        setSicilLoading(true);
        try {
            const res = await GetWithToken('GirisCikisRapor/GetSicilList');
            const list = res?.data?.data || [];
            setSicilList(list);
            setSelectedSicilIds(new Set());
        } catch (e) {
            console.error('Sicil listesi yüklenemedi', e);
            setSicilList([]);
        }
        setSicilLoading(false);
    };

    const toggleSicil = (id) => {
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllSicil = () => {
        setSelectedSicilIds(new Set(sicilList.map((x) => x.id)));
    };

    const unselectAllSicil = () => {
        setSelectedSicilIds(new Set());
    };

    const loadTerminalKayitlari = async (sicilId) => {
        setVeriLoading(true);
        setTerminalKayitlari([]);
        setVeriSicilId(sicilId);
        try {
            const res = await GetWithToken('TerminalKayit/GetBySicilAndDate', {
                sicilId,
                tarih: raporTarih,
            });
            const payload = res?.data?.data ?? res?.data?.Data;
            const list = payload?.list ?? payload?.List ?? [];
            setTerminalKayitlari(list);
        } catch (e) {
            console.error('Terminal kayıtları alınamadı', e);
            const msg = e?.response?.data?.message || e?.response?.data?.Message || e?.message || 'Terminal kayıtları getirilemedi.';
            toast.error(msg);
        }
        setVeriLoading(false);
    };

    const sil = async (id) => {
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        setActionLoading(true);
        try {
            await PostWithToken('TerminalKayit/Delete', { id, deleterName: '' });
            toast.success('Kayıt silindi.');
            if (veriSicilId) loadTerminalKayitlari(veriSicilId);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Silme işlemi başarısız.');
        }
        setActionLoading(false);
    };

    const cikisGirisYap = async (id) => {
        setActionLoading(true);
        try {
            await PostWithToken('TerminalKayit/CikisGirisYap', { id, deleterName: '' });
            toast.success('Kayıt güncellendi.');
            if (veriSicilId) loadTerminalKayitlari(veriSicilId);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'İşlem başarısız.');
        }
        setActionLoading(false);
    };

    const otomatikTanimlaTekSicil = async () => {
        if (!veriSicilId) return;
        setActionLoading(true);
        try {
            const res = await PostWithToken('TerminalKayit/OtoTamamla', {
                sicilId: veriSicilId,
                tarih: raporTarih,
                silinenKontrol: false,
            });
            toast.success(res?.data?.message || 'Otomatik tanımlama tamamlandı.');
            loadTerminalKayitlari(veriSicilId);
        } catch (e) {
            toast.error(e?.response?.data?.message || e?.response?.data?.Message || 'Otomatik tanımlama başarısız.');
        }
        setActionLoading(false);
    };

    const otoTamamla = async () => {
        const firstId = Array.from(selectedSicilIds)[0];
        if (!firstId) {
            toast.warning('Lütfen en az bir personel seçin.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await PostWithToken('TerminalKayit/OtoTamamla', {
                sicilId: firstId,
                tarih: raporTarih,
                silinenKontrol: false,
            });
            const n = res?.data?.data ?? 0;
            toast.success(res?.data?.message || `${n} tasnifleme kaydı oluşturuldu.`);
            if (veriSicilId === firstId) loadTerminalKayitlari(firstId);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Oto tamamlama başarısız.');
        }
        setActionLoading(false);
    };

    const topluOtoTamamla = async () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen en az bir personel seçin.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await PostWithToken('TerminalKayit/TopluOtoTamamla', {
                sicilIds: Array.from(selectedSicilIds),
                baslangicTarihi: raporTarih,
                silinenKontrol: false,
            });
            toast.success(res?.data?.message || 'Toplu oto tamamlama tamamlandı.');
            if (veriSicilId) loadTerminalKayitlari(veriSicilId);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Toplu oto tamamlama başarısız.');
        }
        setActionLoading(false);
    };

    const exportToExcel = () => {
        if (!terminalKayitlari.length) {
            toast.warning('Dışa aktarılacak kayıt yok.');
            return;
        }
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Terminal Kayıtları');
        sheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'Terminal', key: 'terminalAd', width: 20 },
            { header: 'Tarih/Saat', key: 'eventTime', width: 18 },
            { header: 'Giriş/Çıkış', key: 'girisCikis', width: 12 },
            { header: 'Event Code', key: 'eventCode', width: 12 },
        ];
        terminalKayitlari.forEach((row) => {
            sheet.addRow({
                id: row.id,
                terminalAd: row.terminalAd ?? '',
                eventTime: row.eventTime ? formatTarihSaat(row.eventTime) : '',
                girisCikis: row.girisCikis ?? '',
                eventCode: row.eventCode ?? '',
            });
        });
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        const buffer = workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `terminal-kayitlari-${raporTarih}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Excel indirildi.');
    };

    const selectedCount = selectedSicilIds.size;

    return (
        <Layout>
            <PageHeader
                title="Terminal Kayıtları"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/terminal-kayitlari', name: 'Terminal Kayıtları' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Rapor Seçimi</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-2">
                                <label className="form-label">Rapor Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={raporTarih}
                                    onChange={(e) => setRaporTarih(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-3 g-3">
                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-2">Personel Listesi ({sicilList.length} kişi)</h5>
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={selectAllSicil}
                                            disabled={sicilLoading || !sicilList.length}
                                        >
                                            Tümünü Seç
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={unselectAllSicil}
                                            disabled={sicilLoading}
                                        >
                                            Seçimi Kaldır
                                        </button>
                                        <span className="badge bg-secondary">Seçili: {selectedCount}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={otoTamamla}
                                        disabled={actionLoading || selectedCount === 0}
                                    >
                                        {actionLoading ? (
                                            <span className="spinner-border spinner-border-sm me-1" />
                                        ) : (
                                            <i className="icon-checkmark-circle me-1" />
                                        )}
                                        Seçilenleri Oto Tamamla
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {sicilLoading ? (
                                    <div className="p-4 text-center">
                                        <span className="spinner-border spinner-border-sm" /> Yükleniyor...
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
                                        <table className="table table-bordered table-hover table-sm mb-0">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th style={{ width: 40 }}>Seç</th>
                                                    <th>Sicil No</th>
                                                    <th>Ad Soyad</th>
                                                    <th>Firma</th>
                                                    <th>Bölüm</th>
                                                    <th style={{ width: 52 }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sicilList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center text-muted">
                                                            Filtreye uygun personel bulunamadı.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    sicilList.map((row) => (
                                                        <tr key={row.id}>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSicilIds.has(row.id)}
                                                                    onChange={() => toggleSicil(row.id)}
                                                                />
                                                            </td>
                                                            <td>{row.sicilNo ?? '-'}</td>
                                                            <td>
                                                                {((row.ad || '') + ' ' + (row.soyad || '')).trim() || '-'}
                                                            </td>
                                                            <td>{row.firma ?? '-'}</td>
                                                            <td>{row.bolum ?? '-'}</td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-sm py-1 px-2"
                                                                    onClick={() => loadTerminalKayitlari(row.id)}
                                                                    disabled={veriLoading}
                                                                    title="Terminal kayıtlarını göster"
                                                                >
                                                                    <i className="icon-search4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-6">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    Terminal Kayıtları
                                    {veriSicilId && (
                                        <small className="text-muted ms-2">
                                            — {raporTarih} tarihinden itibaren ({terminalKayitlari.length} kayıt)
                                        </small>
                                    )}
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                {veriLoading ? (
                                    <div className="p-5 text-center">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Yükleniyor...
                                    </div>
                                ) : !veriSicilId ? (
                                    <div className="p-5 text-center text-muted">
                                        <i className="icon-search4 d-block fs-1 mb-2" />
                                        Bir personel satırındaki <i className="icon-search4" /> büyüteç ikonuna tıklayarak terminal kayıtlarını görüntüleyin.
                                    </div>
                                ) : terminalKayitlari.length === 0 ? (
                                    <div className="p-5 text-center text-muted">
                                        Bu personel için seçilen tarihte terminal kaydı bulunamadı.
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
                                        <table className="table table-bordered table-hover table-sm mb-0">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th>Id</th>
                                                    <th>Terminal</th>
                                                    <th>Tarih / Saat</th>
                                                    <th>Giriş/Çıkış</th>
                                                    <th>Event Code</th>
                                                    <th style={{ width: 160 }}>İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {terminalKayitlari.map((row) => (
                                                    <tr key={row.id}>
                                                        <td>{row.id}</td>
                                                        <td>{row.terminalAd ?? '-'}</td>
                                                        <td>{formatTarihSaat(row.eventTime)}</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${
                                                                    row.girisCikis === 'Giriş'
                                                                        ? 'bg-success'
                                                                        : row.girisCikis === 'Çıkış'
                                                                            ? 'bg-warning text-dark'
                                                                            : 'bg-secondary'
                                                                }`}
                                                            >
                                                                {row.girisCikis}
                                                            </span>
                                                        </td>
                                                        <td>{row.eventCode ?? '-'}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-info btn-sm me-1 py-1 px-2"
                                                                onClick={otomatikTanimlaTekSicil}
                                                                disabled={actionLoading}
                                                                title="Otomatik Tanımla"
                                                            >
                                                                <i className="icon-checkmark-circle" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm me-1 py-1 px-2"
                                                                onClick={() => cikisGirisYap(row.id)}
                                                                disabled={actionLoading}
                                                                title="Giriş/Çıkış olarak değiştir"
                                                            >
                                                                <i className="icon-loop" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm py-1 px-2"
                                                                onClick={() => sil(row.id)}
                                                                disabled={actionLoading}
                                                                title="Sil"
                                                            >
                                                                <i className="icon-trash" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
