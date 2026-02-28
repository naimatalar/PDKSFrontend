import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import ReactSelect from 'react-select';
import { GetWithToken } from '../../api/crud';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';

const formatTarih = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return val;
    }
};

const formatSaat = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return val;
    }
};

const formatSure = (dakika) => {
    if (dakika == null || dakika === undefined) return '-';
    const h = Math.floor(dakika / 60);
    const m = dakika % 60;
    if (h > 0) return `${h} sa ${m} dk`;
    return `${m} dk`;
};

const tableCols = [
    { key: 'tarih', label: 'Tarih', format: (row) => row.mesaiTarih ? new Date(row.mesaiTarih).toLocaleDateString('tr-TR') : new Date(row.giris).toLocaleDateString('tr-TR') },
    { key: 'giris', label: 'Giriş Saati', format: (row) => formatSaat(row.giris) },
    { key: 'girisTerminalAd', label: 'Giriş Terminali', format: (row) => row.girisTerminalAd || '-' },
    { key: 'cikis', label: 'Çıkış Saati', format: (row) => formatSaat(row.cikis) },
    { key: 'cikisTerminalAd', label: 'Çıkış Terminali', format: (row) => row.cikisTerminalAd || '-' },
    { key: 'mesaiSuresi', label: 'İçeride Kalma', format: (row) => formatSure(row.mesaiSuresi) },
    { key: 'normalMesai', label: 'Normal Mesai', format: (row) => formatSure(row.normalMesai) },
    { key: 'fazlaMesai', label: 'Fazla Mesai', format: (row) => formatSure(row.fazlaMesai) },
    { key: 'aciklama', label: 'Açıklama', format: (row) => row.mesaiAciklama || row.izinTipAd || '-' },
];

const tableColsTerminal = [
    { key: 'sicilAd', label: 'Personel', format: (row) => row.sicilAd || '-' },
    { key: 'tarih', label: 'Tarih', format: (row) => row.mesaiTarih ? new Date(row.mesaiTarih).toLocaleDateString('tr-TR') : new Date(row.giris).toLocaleDateString('tr-TR') },
    { key: 'giris', label: 'Giriş Saati', format: (row) => formatSaat(row.giris) },
    { key: 'girisTerminalAd', label: 'Giriş Terminali', format: (row) => row.girisTerminalAd || '-' },
    { key: 'cikis', label: 'Çıkış Saati', format: (row) => formatSaat(row.cikis) },
    { key: 'cikisTerminalAd', label: 'Çıkış Terminali', format: (row) => row.cikisTerminalAd || '-' },
];

export default function PuantajIndex() {
    const [activeTab, setActiveTab] = useState('personel');

    const [sicilList, setSicilList] = useState([]);
    const [selectedSicil, setSelectedSicil] = useState(null);

    const [terminalList, setTerminalList] = useState([]);
    const [selectedTerminal, setSelectedTerminal] = useState(null);

    const [baslangic, setBaslangic] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [bitis, setBitis] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const isTerminalDateRangeValid = (startStr, endStr) => {
        if (!startStr || !endStr) return false;
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
        if (end < start) return false;
        const maxEnd = new Date(start);
        maxEnd.setMonth(maxEnd.getMonth() + 1);
        return end <= maxEnd;
    };

    useEffect(() => {
        loadSicilList();
        loadTerminalList();
    }, []);

    const loadSicilList = async () => {
        try {
            const res = await GetWithToken('Sicil/GetAll', { PageNumber: 0, PageSize: 2000 });
            const list = res?.data?.data?.list || [];
            setSicilList(list.map((x) => ({ value: x.id, label: `${x.ad || ''} ${x.soyad || ''} (${x.personelNo || x.sicilNo || x.id})`.trim() })));
        } catch (e) {
            console.error('Sicil listesi yüklenemedi', e);
        }
    };

    const loadTerminalList = async () => {
        try {
            const res = await GetWithToken('Terminaller/GetAll', { PageNumber: 0, PageSize: 500 });
            const list = res?.data?.data?.list || [];
            setTerminalList(list.map((x) => ({ value: x.id ?? x.Id, label: x.name ?? x.Name ?? `Terminal ${x.id ?? x.Id}` })));
        } catch (e) {
            console.error('Terminal listesi yüklenemedi', e);
        }
    };

    const sorgulaPersonel = async () => {
        if (!selectedSicil?.value) return;
        setLoading(true);
        try {
            const res = await GetWithToken('Tasnifleme/GetBySicilAndDateRange', {
                sicilId: selectedSicil.value,
                baslangic,
                bitis,
            });
            setData({ ...res?.data, tabType: 'personel' });
        } catch (e) {
            console.error('Puantaj yüklenemedi', e);
            setData(null);
        }
        setLoading(false);
    };

    const sorgulaTerminal = async () => {
        if (!selectedTerminal?.value) return;
        if (!baslangic || !bitis) {
            toast.warning('Başlangıç ve bitiş tarihi zorunludur.');
            return;
        }
        if (!isTerminalDateRangeValid(baslangic, bitis)) {
            toast.warning('Terminal Bazlı Geçişler için tarih aralığı en fazla 1 ay olabilir.');
            return;
        }
        setLoading(true);
        try {
            const res = await GetWithToken('Tasnifleme/GetByTerminalAndDateRange', {
                terminalId: selectedTerminal.value,
                baslangic,
                bitis,
            });
            setData({ ...res?.data, tabType: 'terminal' });
        } catch (e) {
            console.error('Puantaj yüklenemedi', e);
            setData(null);
        }
        setLoading(false);
    };

    const list = data?.list || [];
    const terminalRangeInvalid = activeTab === 'terminal' && !isTerminalDateRangeValid(baslangic, bitis);

    const exportToExcel = () => {
        if (!list.length) return;
        const cols = data?.tabType === 'terminal' ? tableColsTerminal : tableCols;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Puantaj Geçişleri');
        sheet.addRow(cols.map((c) => c.label)).font = { bold: true };
        list.forEach((row) => {
            sheet.addRow(cols.map((c) => (c.format ? c.format(row) : row[c.key] ?? '')));
        });
        sheet.columns.forEach((col, i) => { col.width = 18; });
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `puantaj-gecisleri-${baslangic}-${bitis}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    const renderTable = (columns) => (
        <div className="table-responsive">
            <table className="table table-bordered table-hover">
                <thead className="table-light">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key}>{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {list.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center">
                                Kayıt bulunamadı.
                            </td>
                        </tr>
                    ) : (
                        list.map((row) => (
                            <tr key={row.id}>
                                {columns.map((c) => (
                                    <td key={c.key}>{c.format ? c.format(row) : (row[c.key] ?? '-')}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const showResults = data && (activeTab === 'personel' ? data.tabType === 'personel' : data.tabType === 'terminal');
    const labelName = data?.tabType === 'personel' ? data.sicilAd : data?.terminalAd;

    return (
        <Layout>
            <PageHeader
                title="Puantaj - Giriş Çıkış Detay"
                map={[
                    { url: 'sicil', name: 'Sicil' },
                    { url: 'sicil/puantaj', name: 'Puantaj' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Giriş Çıkış Detay Sorgulama</h5>
                    </div>
                    <div className="card-body">
                        <Nav tabs className="nav-tabs mb-3">
                            <NavItem>
                                <NavLink
                                    active={activeTab === 'personel'}
                                    onClick={() => setActiveTab('personel')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Personel Bazlı Geçişler
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={activeTab === 'terminal'}
                                    onClick={() => setActiveTab('terminal')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Terminal Bazlı Geçişler
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="personel" className="pt-2">
                                <div className="row align-items-end mb-4">
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Personel (Sicil)</label>
                                        <ReactSelect
                                            options={sicilList}
                                            value={selectedSicil}
                                            onChange={setSelectedSicil}
                                            placeholder="Personel seçin..."
                                            isClearable
                                            isSearchable
                                        />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label">Başlangıç Tarihi</label>
                                        <input type="date" className="form-control" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input type="date" className="form-control" value={bitis} onChange={(e) => setBitis(e.target.value)} />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <button className="btn btn-primary w-100" onClick={sorgulaPersonel} disabled={!selectedSicil?.value || loading}>
                                            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="icon-search4" />} Sorgula
                                        </button>
                                    </div>
                                </div>
                            </TabPane>

                            <TabPane tabId="terminal" className="pt-2">
                                <div className="row align-items-end mb-4">
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Terminal</label>
                                        <ReactSelect
                                            options={terminalList}
                                            value={selectedTerminal}
                                            onChange={setSelectedTerminal}
                                            placeholder="Terminal seçin..."
                                            isClearable
                                            isSearchable
                                        />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label">Başlangıç Tarihi</label>
                                        <input type="date" className="form-control" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input type="date" className="form-control" value={bitis} onChange={(e) => setBitis(e.target.value)} />
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <button className="btn btn-primary w-100" onClick={sorgulaTerminal} disabled={!selectedTerminal?.value || loading || terminalRangeInvalid}>
                                            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="icon-search4" />} Sorgula
                                        </button>
                                    </div>
                                    {terminalRangeInvalid && (
                                        <div className="col-12">
                                            <small className="text-danger">Terminal Bazlı Geçişler için tarih aralığı en fazla 1 ay olmalıdır.</small>
                                        </div>
                                    )}
                                </div>
                            </TabPane>
                        </TabContent>

                        {showResults && (
                            <>
                                <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div>
                                        <strong>{data?.tabType === 'personel' ? 'Personel' : 'Terminal'}:</strong> {labelName} |{' '}
                                        <strong>Tarih Aralığı:</strong> {data.baslangic} - {data.bitis} | <strong>Kayıt:</strong> {list.length} adet
                                    </div>
                                    <button type="button" className="btn btn-sm btn-success" onClick={exportToExcel} disabled={!list.length}>
                                        <i className="icon-file-excel me-1" /> Excel
                                    </button>
                                </div>
                                {renderTable(data?.tabType === 'terminal' ? tableColsTerminal : tableCols)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
