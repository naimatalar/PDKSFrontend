import React, { useEffect, useState } from 'react';
import Layout from '../../layout/layout';
import PageHeader from '../../layout/pageheader';
import { GetWithToken } from '../api/crud';
import ReactSelect from 'react-select';
import styles from './AylikRaporlama.module.css';

const formatTarih = (val) => {
    if (!val) return '-';
    try {
        return new Date(val).toLocaleDateString('tr-TR');
    } catch {
        return val;
    }
};

export default function AylikRaporlamaIndex() {
    const [firmaList, setFirmaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [yakaList, setYakaList] = useState([]);

    const [baslangic, setBaslangic] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [bitis, setBitis] = useState(() => new Date().toISOString().split('T')[0]);
    const [firmaId, setFirmaId] = useState(0);
    const [altFirmaId, setAltFirmaId] = useState(0);
    const [bolumId, setBolumId] = useState(0);
    const [pozisyonId, setPozisyonId] = useState(0);
    const [gorevId, setGorevId] = useState(0);
    const [yakaId, setYakaId] = useState(0);

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        setOptionsLoading(true);
        const pagination = { PageNumber: 1, PageSize: 500 };
        const fetchOpt = (url) =>
            GetWithToken(url, pagination)
                .then((r) => r.data?.data?.list || [])
                .catch(() => []);

        const [firma, altFirma, bolum, pozisyon, gorev, yaka] = await Promise.all([
            fetchOpt('CboFirma/GetAll'),
            fetchOpt('CboAltFirma/GetAll'),
            fetchOpt('CboBolum/GetAll'),
            fetchOpt('CboPozisyon/GetAll'),
            fetchOpt('CboGorev/GetAll'),
            fetchOpt('CboYaka/GetAll'),
        ]);

        setFirmaList([{ value: 0, label: 'Tümü' }, ...firma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setAltFirmaList([{ value: 0, label: 'Tümü' }, ...altFirma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setBolumList([{ value: 0, label: 'Tümü' }, ...bolum.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setPozisyonList([{ value: 0, label: 'Tümü' }, ...pozisyon.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setGorevList([{ value: 0, label: 'Tümü' }, ...gorev.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setYakaList([{ value: 0, label: 'Tümü' }, ...yaka.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setOptionsLoading(false);
    };

    const runReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const params = new URLSearchParams({
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
                firmaId: firmaId || 0,
                altFirmaId: altFirmaId || 0,
                bolumId: bolumId || 0,
                pozisyonId: pozisyonId || 0,
                gorevId: gorevId || 0,
                yakaId: yakaId || 0,
            });
            const res = await GetWithToken(`AylikRapor/GetReport?${params}`);
            setReportData(res?.data?.data || null);
        } catch (e) {
            console.error('Rapor alınamadı', e);
        } finally {
            setLoading(false);
        }
    };

    const getCellClass = (cssClass) => {
        if (cssClass === 'is-girmedi') return styles.cellIsGirmedi;
        if (cssClass === 'gec') return styles.cellGec;
        if (cssClass === 'haftalik_izin') return styles.cellHaftalikIzin;
        if (cssClass === 'izin') return styles.cellIzin;
        return '';
    };

    return (
        <Layout contentOverflowXHidden>
            <div style={{ minWidth: 0, overflowX: 'hidden', width: '100%' }}>
                <PageHeader
                    title="Aylık Rapor"
                    map={[
                        { url: 'raporlar', name: 'Raporlar' },
                        { url: 'AylikRaporlama', name: 'Aylık Rapor' },
                    ]}
                />
                <div className={`content p-4 ${styles.pageWrap}`}>
                <div className={`card ${styles.filterCard}`}>
                    <div className="card-header">
                        <h5 className="mb-0">Filtreler</h5>
                    </div>
                    <div className="card-body">
                        <div className={styles.filterRow}>
                            <div className={styles.filterItem}>
                                <label className="form-label small mb-1">Başlangıç</label>
                                <input type="date" className="form-control form-control-sm" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
                            </div>
                            <div className={styles.filterItem}>
                                <label className="form-label small mb-1">Bitiş</label>
                                <input type="date" className="form-control form-control-sm" value={bitis} onChange={(e) => setBitis(e.target.value)} />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Firma</label>
                                <ReactSelect
                                    options={firmaList}
                                    value={firmaList.find((x) => x.value === firmaId) || firmaList[0]}
                                    onChange={(o) => setFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Alt Firma</label>
                                <ReactSelect
                                    options={altFirmaList}
                                    value={altFirmaList.find((x) => x.value === altFirmaId) || altFirmaList[0]}
                                    onChange={(o) => setAltFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Bölüm</label>
                                <ReactSelect
                                    options={bolumList}
                                    value={bolumList.find((x) => x.value === bolumId) || bolumList[0]}
                                    onChange={(o) => setBolumId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Pozisyon</label>
                                <ReactSelect
                                    options={pozisyonList}
                                    value={pozisyonList.find((x) => x.value === pozisyonId) || pozisyonList[0]}
                                    onChange={(o) => setPozisyonId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Görev</label>
                                <ReactSelect
                                    options={gorevList}
                                    value={gorevList.find((x) => x.value === gorevId) || gorevList[0]}
                                    onChange={(o) => setGorevId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItemWide}>
                                <label className="form-label small mb-1">Yaka</label>
                                <ReactSelect
                                    options={yakaList}
                                    value={yakaList.find((x) => x.value === yakaId) || yakaList[0]}
                                    onChange={(o) => setYakaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <button
                                    type="button"
                                    className={`btn btn-primary btn-sm ${styles.runButton}`}
                                    onClick={runReport}
                                    disabled={loading || optionsLoading}
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="icon-play3 me-1" />}
                                    Raporu Getir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData && (
                    <div className={`card mt-3 ${styles.reportCard}`}>
                        <div className={styles.reportHeader}>
                            <h5 className={styles.reportTitle}>
                                Rapor: {reportData.baslangicTarihi} — {reportData.bitisTarihi}
                            </h5>
                            <span className={`badge bg-primary ${styles.reportBadge}`}>{reportData.toplamKisi} Kişi</span>
                        </div>
                        <div
                            className={styles.tableScrollOuter}
                            style={{
                                overflowX: 'auto',
                                overflowY: 'auto',
                                width: '100%',
                                maxHeight: 'calc(100vh - 320px)',
                            }}
                        >
                            <div style={{ width: 'max-content', minWidth: '100%' }}>
                                <table className="table table-bordered table-sm">
                                <thead>
                                    <tr>
                                        <th className={styles.personelCol}>Personel</th>
                                        {reportData.gunler?.map((g) => (
                                            <th key={g} className={styles.dayCol}>
                                                {formatTarih(g)}
                                            </th>
                                        ))}
                                        <th className={styles.summaryCol}>Fazla Mesai</th>
                                        <th className={styles.summaryCol}>Eksik Mesai</th>
                                        <th className={styles.summaryCol}>Sonuç</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.rows?.length ? (
                                        reportData.rows.map((row) => (
                                            <tr key={row.sicilId}>
                                                <td className={styles.personelCol}>
                                                    {row.ad} {row.soyad}
                                                </td>
                                                {row.gunler?.map((gun, idx) => (
                                                    <td
                                                        key={`${row.sicilId}-${idx}`}
                                                        className={`${styles.dayCol} ${getCellClass(gun.cssClass)}`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: gun.girisCikis || '-',
                                                        }}
                                                    />
                                                ))}
                                                <td className={styles.summaryCol}>
                                                    {row.toplamFazlaMesai} dk / {row.fazlaMesaiGun} gün
                                                </td>
                                                <td className={styles.summaryCol}>
                                                    {row.toplamEksikMesai} dk / {row.eksikMesaiGun} gün
                                                </td>
                                                <td className={styles.summaryCol}>
                                                    {row.sonuc} dk / {row.sonucSaat} saat
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={(reportData.gunler?.length || 0) + 4} className={styles.noData}>
                                                Kayıt bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={styles.legendWrap}>
                            <span className="fw-semibold text-muted small">Renk Açıklaması:</span>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: '#dcfce7' }} />
                                <span>İşe Girmeden</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: 'transparent', border: '1px solid #dc2626' }} />
                                <span>Geç Giriş</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: '#dbeafe' }} />
                                <span>Haftalık İzin</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{ background: '#fef9c3' }} />
                                <span>İzinli</span>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </Layout>
    );
}
