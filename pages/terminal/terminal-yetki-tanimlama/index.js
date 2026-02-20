import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function TerminalYetkiTanimlamaIndex() {
    const [loading, setLoading] = useState(true);
    const [terminalGrupList, setTerminalGrupList] = useState([]);
    const [terminalList, setTerminalList] = useState([]);
    const [selectedGrup, setSelectedGrup] = useState(null);
    const [grubaTaniliTerminaller, setGrubaTaniliTerminaller] = useState([]);
    const [eklenecekTerminal, setEklenecekTerminal] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const yukleGruplarVeTerminaller = async () => {
        const [gruplarRes, terminallerRes] = await Promise.all([
            GetWithToken('TerminalGroup/GetAll', { PageNumber: 1, PageSize: 500 }).catch(() => ({ data: { data: { list: [] } } })),
            GetWithToken('Terminaller/GetAll', { PageNumber: 1, PageSize: 500 }).catch(() => ({ data: { data: { list: [] } } })),
        ]);
        setTerminalGrupList((gruplarRes.data?.data?.list || []).map((m) => ({ id: m.id, ad: m.ad || m.Ad })));
        setTerminalList((terminallerRes.data?.data?.list || []).map((m) => ({ id: m.id, name: m.name || m.Name, port: m.port || m.Port })));
    };

    const grupaTaniliTerminalleriYukle = async (grupId) => {
        const res = await GetWithToken('TerminalRelation/GetByTerminalGroupId', { terminalGrubuId: grupId });
        setGrubaTaniliTerminaller(res?.data?.data || []);
    };

    useEffect(() => {
        yukleGruplarVeTerminaller().then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedGrup?.id) {
            grupaTaniliTerminalleriYukle(selectedGrup.id);
        } else {
            setGrubaTaniliTerminaller([]);
        }
    }, [selectedGrup?.id]);

    const grupSec = (grup) => setSelectedGrup(grup);

    const terminalEkle = async () => {
        if (!selectedGrup?.id || !eklenecekTerminal) {
            AlertFunction('Uyarı', 'Terminal seçiniz.');
            return;
        }
        setIsAdding(true);
        try {
            const res = await PostWithToken('TerminalRelation/Create', {
                terminalGrubu: selectedGrup.id,
                terminal: parseInt(eklenecekTerminal),
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setEklenecekTerminal('');
            grupaTaniliTerminalleriYukle(selectedGrup.id);
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setIsAdding(false);
        }
    };

    const terminalSil = async (relationId) => {
        try {
            const res = await PostWithToken('TerminalRelation/Delete', { Id: relationId });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            grupaTaniliTerminalleriYukle(selectedGrup.id);
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const zatenTaniliTerminalIds = grubaTaniliTerminaller.map((t) => t.terminal);
    const eklenebilirTerminaller = terminalList.filter((t) => !zatenTaniliTerminalIds.includes(t.id));

    return (
        <>
            {loading && <PageLoading />}
            <Layout>
                <PageHeader
                    title="Terminal Yetki Tanımlama"
                    map={[
                        { url: 'terminal', name: 'Terminal' },
                        { url: 'terminal/terminal-yetki-tanimlama', name: 'Terminal Yetki Tanımlama' },
                    ]}
                />
                <div className="content pr-3 pl-3">
                    <div className="row">
                        <div className="col-12 col-md-4 col-lg-3">
                            <div className="card">
                                <div className="card-header bg-transparent">
                                    <h6 className="card-title mb-0">Terminal Grupları</h6>
                                    <small className="text-muted">Grubu seçin</small>
                                </div>
                                <div className="card-body p-0">
                                    <ol className="rounded-list list-unstyled mb-0">
                                        {terminalGrupList.map((grup) => (
                                            <li
                                                key={grup.id}
                                                onClick={() => grupSec(grup)}
                                                style={{ cursor: 'pointer', padding: '10px 15px', borderBottom: '1px solid #eee' }}
                                                className={selectedGrup?.id === grup.id ? 'bg-primary text-white' : ''}
                                            >
                                                <i className="fa fa-caret-right mr-2" />
                                                {grup.ad}
                                            </li>
                                        ))}
                                        {terminalGrupList.length === 0 && (
                                            <li className="p-3 text-muted">Terminal grubu bulunamadı</li>
                                        )}
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-8 col-lg-9">
                            <div className="card">
                                <div className="card-header">
                                    <h6 className="card-title mb-0">
                                        {selectedGrup ? `${selectedGrup.ad} - Tanımlı Terminaller` : 'Terminal Grubu Seçiniz'}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {selectedGrup ? (
                                        <>
                                            <div className="row mb-3 align-items-end">
                                                <div className="col-md-8">
                                                    <label className="form-label">Terminal Ekle</label>
                                                    <select
                                                        className="form-control"
                                                        value={eklenecekTerminal}
                                                        onChange={(e) => setEklenecekTerminal(e.target.value)}
                                                    >
                                                        <option value="">Terminal seçiniz...</option>
                                                        {eklenebilirTerminaller.map((t) => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.name} {t.port ? `(${t.port})` : ''}
                                                            </option>
                                                        ))}
                                                        {eklenebilirTerminaller.length === 0 && (
                                                            <option value="" disabled>Tüm terminaller zaten tanımlı</option>
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <DebisButton onClick={terminalEkle} disabled={!eklenecekTerminal || isAdding}>
                                                        <i className="fa fa-plus mr-1" /> Ekle
                                                    </DebisButton>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-muted small mb-2">
                                                    Bu gruba tanımlı {grubaTaniliTerminaller.length} terminal
                                                </p>
                                                {grubaTaniliTerminaller.length > 0 ? (
                                                    <ul className="list-group">
                                                        {grubaTaniliTerminaller.map((rel) => (
                                                            <li
                                                                key={rel.id}
                                                                className="list-group-item d-flex justify-content-between align-items-center"
                                                            >
                                                                <span>
                                                                    {rel.terminalAd}
                                                                    {rel.terminalPort && (
                                                                        <small className="text-muted ml-2">({rel.terminalPort})</small>
                                                                    )}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => terminalSil(rel.id)}
                                                                    title="Kaldır"
                                                                >
                                                                    <i className="fa fa-times" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-muted">Bu gruba henüz terminal tanımlanmamış. Yukarıdan ekleyebilirsiniz.</p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted mb-0">
                                            <i className="fa fa-arrow-left mr-2" />
                                            Soldan bir terminal grubu seçerek, o gruba hangi terminallerin tanımlı olacağını yönetebilirsiniz.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
