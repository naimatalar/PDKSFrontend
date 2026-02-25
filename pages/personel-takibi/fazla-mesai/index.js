import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-toastify';

const sorguTipiOptions = [
    { value: '0', label: 'Hepsi (Fazla veya Onaylı FM > 0)' },
    { value: '1', label: 'Onaysız Fazla Mesai (Onaylı = 0, FM > 0)' },
    { value: '2', label: 'Onaylı Fazla Mesai (Onaylı > 0)' },
];

const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
};

export default function FazlaMesaiIndex() {
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

    const [sorguTipi, setSorguTipi] = useState('0');

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [tekFmModalOpen, setTekFmModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState(null);

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
            const res = await GetWithToken(`ToplamSure/GetReport?${params}`);
            setReportData(res?.data?.data || null);
        } catch (e) {
            console.error('Fazla mesai raporu alınamadı', e);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!filteredList.length) return;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Fazla Mesai', {
            views: [{ state: 'frozen', ySplit: 2, activeCell: 'A2' }],
        });

        const titleRow = sheet.addRow([
            `Fazla Mesai Raporu - ${reportData.baslangicTarihi} / ${reportData.bitisTarihi} (${filteredList.length} Kişi)`,
        ]);
        titleRow.font = { bold: true, size: 14 };
        titleRow.alignment = { horizontal: 'center' };
        sheet.mergeCells(1, 1, 1, 10);
        titleRow.height = 24;

        const colHeaders = [
            'Ad Soyad',
            'Sicil No',
            'Giriş',
            'Çıkış',
            'Açıklama',
            'FM',
            'OFM',
            'FM Oranı',
            'Firma',
            'İşlemler',
        ];
        const headerRow = sheet.addRow(colHeaders);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 22;
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        filteredList.forEach((row) => {
            const fmMin = parseTimeToMinutes(row.fazlaMesai);
            const ofmMin = parseTimeToMinutes(row.oFazlaMesai);
            const fmOrani = fmMin > 0 ? ((ofmMin / fmMin) * 100).toFixed(1) + '%' : '-';
            const dataRow = sheet.addRow([
                row.adSoyad ?? '',
                row.sicilNo ?? '',
                row.giris ?? '',
                row.cikis ?? '',
                row.aciklama ?? '',
                row.fazlaMesai ?? '',
                row.oFazlaMesai ?? '',
                fmOrani,
                row.firmaAd ?? '',
                '',
            ]);
            const rowFill =
                ofmMin > 0
                    ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB3FDB1' } }
                    : fmMin > 0
                    ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } }
                    : null;
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                if (rowFill) cell.fill = rowFill;
            });
        });

        sheet.columns = [
            { width: 22 },
            { width: 14 },
            { width: 18 },
            { width: 18 },
            { width: 20 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 18 },
            { width: 12 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fazla-mesai-${reportData.baslangicTarihi}-${reportData.bitisTarihi}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const list = reportData?.list ?? [];

    const filteredList = list.filter((row) => {
        const fm = parseTimeToMinutes(row.fazlaMesai);
        const ofm = parseTimeToMinutes(row.oFazlaMesai);

        if (sorguTipi === '0') {
            return ofm > 0 || fm > 0;
        }
        if (sorguTipi === '1') {
            return ofm === 0 && fm > 0;
        }
        if (sorguTipi === '2') {
            return ofm > 0;
        }
        return true;
    });

    return (
        <Layout>
            <PageHeader
                title="Fazla Mesai"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/fazla-mesai', name: 'Fazla Mesai' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Filtreler</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-2">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={baslangic}
                                    onChange={(e) => setBaslangic(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bitis}
                                    onChange={(e) => setBitis(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Firma</label>
                                <ReactSelect
                                    options={firmaList}
                                    value={firmaList.find((x) => x.value === firmaId) || firmaList[0]}
                                    onChange={(o) => setFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Alt Firma</label>
                                <ReactSelect
                                    options={altFirmaList}
                                    value={altFirmaList.find((x) => x.value === altFirmaId) || altFirmaList[0]}
                                    onChange={(o) => setAltFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bölüm</label>
                                <ReactSelect
                                    options={bolumList}
                                    value={bolumList.find((x) => x.value === bolumId) || bolumList[0]}
                                    onChange={(o) => setBolumId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Pozisyon</label>
                                <ReactSelect
                                    options={pozisyonList}
                                    value={pozisyonList.find((x) => x.value === pozisyonId) || pozisyonList[0]}
                                    onChange={(o) => setPozisyonId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Görev</label>
                                <ReactSelect
                                    options={gorevList}
                                    value={gorevList.find((x) => x.value === gorevId) || gorevList[0]}
                                    onChange={(o) => setGorevId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Yaka</label>
                                <ReactSelect
                                    options={yakaList}
                                    value={yakaList.find((x) => x.value === yakaId) || yakaList[0]}
                                    onChange={(o) => setYakaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Sorgu Tipi</label>
                                <ReactSelect
                                    options={sorguTipiOptions}
                                    value={sorguTipiOptions.find((x) => x.value === sorguTipi) || sorguTipiOptions[0]}
                                    onChange={(o) => setSorguTipi(o?.value ?? '0')}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-4 d-flex align-items-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary flex-grow-1"
                                    onClick={runReport}
                                    disabled={loading || optionsLoading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-1" />
                                    ) : (
                                        <i className="icon-play3 me-1" />
                                    )}
                                    {' '}Raporu Getir
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={exportToExcel}
                                    disabled={!filteredList.length || loading || optionsLoading}
                                    title="Raporu Excel olarak indir"
                                >
                                    <i className="icon-file-excel me-1" />
                                    {' '}Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData && (
                    <div className="card mt-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                Fazla Mesai: {reportData.baslangicTarihi} - {reportData.bitisTarihi}
                            </h5>
                            <span className="badge bg-primary">Kişi Sayısı: {filteredList.length}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ minWidth: 160 }}>Ad Soyad</th>
                                            <th style={{ minWidth: 100 }}>Sicil No</th>
                                            <th style={{ minWidth: 120 }}>Giriş</th>
                                            <th style={{ minWidth: 120 }}>Çıkış</th>
                                            <th style={{ minWidth: 120 }}>Açıklama</th>
                                            <th style={{ minWidth: 90 }}>FM</th>
                                            <th style={{ minWidth: 90 }}>OFM</th>
                                            <th style={{ minWidth: 90 }}>FM Oranı</th>
                                            <th style={{ minWidth: 120 }}>Firma</th>
                                            <th style={{ minWidth: 100 }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.map((row) => {
                                            const fmMin = parseTimeToMinutes(row.fazlaMesai);
                                            const ofmMin = parseTimeToMinutes(row.oFazlaMesai);
                                            const fmOrani = fmMin > 0 ? ((ofmMin / fmMin) * 100).toFixed(1) + '%' : '-';
                                            const rowStyle =
                                                ofmMin > 0
                                                    ? { backgroundColor: '#b3fdb1' }
                                                    : fmMin > 0
                                                    ? { backgroundColor: '#ffe0e0' }
                                                    : {};
                                            return (
                                                <tr key={row.sicilId} style={rowStyle}>
                                                    <td><strong>{row.adSoyad ?? '-'}</strong></td>
                                                    <td>{row.sicilNo ?? '-'}</td>
                                                    <td>{row.giris ?? '-'}</td>
                                                    <td>{row.cikis ?? '-'}</td>
                                                    <td>{row.aciklama ?? '-'}</td>
                                                    <td>{row.fazlaMesai ?? '-'}</td>
                                                    <td>{row.oFazlaMesai ?? '-'}</td>
                                                    <td>{fmOrani}</td>
                                                    <td>{row.firmaAd ?? '-'}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm py-1 px-2"
                                                            onClick={() => {
                                                                setActiveRow(row);
                                                                setTekFmModalOpen(true);
                                                            }}
                                                        >
                                                            <i className="icon-plus2" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {!filteredList.length && (
                                            <tr>
                                                <td colSpan={10} className="text-center text-muted">
                                                    Kayıt bulunamadı.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={tekFmModalOpen}
                toggle={() => {
                    setTekFmModalOpen(false);
                    setActiveRow(null);
                }}
                size="md"
            >
                <ModalHeader
                    toggle={() => {
                        setTekFmModalOpen(false);
                        setActiveRow(null);
                    }}
                >
                    Tek Fazla Mesai Ekle
                    {activeRow && ` - ${activeRow.adSoyad ?? ''} (${activeRow.sicilNo ?? ''})`}
                </ModalHeader>
                <ModalBody>
                    {!activeRow ? (
                        <div className="p-3 text-center text-muted">Kayıt seçilmedi.</div>
                    ) : (
                        <Formik
                            initialValues={{
                                saat: Math.floor(
                                    (parseTimeToMinutes(activeRow.oFazlaMesai) ||
                                        parseTimeToMinutes(activeRow.fazlaMesai) ||
                                        0) / 60
                                ),
                                dakika:
                                    (parseTimeToMinutes(activeRow.oFazlaMesai) ||
                                        parseTimeToMinutes(activeRow.fazlaMesai) ||
                                        0) % 60,
                                aciklama: activeRow.aciklama || '',
                            }}
                            enableReinitialize
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    const hours = Number(values.saat) || 0;
                                    let minutes = Number(values.dakika) || 0;
                                    if (minutes < 0) minutes = 0;
                                    if (minutes > 59) minutes = 59;
                                    const total = hours * 60 + minutes;

                                    const payload = {
                                        sicilId: parseInt(activeRow.sicilId, 10),
                                        value: total,
                                        aciklama: values.aciklama || '',
                                        baslangicTarihi: baslangic,
                                        bitisTarihi: bitis,
                                    };
                                    const res = await PostWithToken('Tasnifleme/TekFazlaMesaiEkle', payload);
                                    const msg =
                                        res?.data?.message || res?.data?.Message || 'Tek fazla mesai kaydı güncellendi.';
                                    toast.success(msg);
                                    setTekFmModalOpen(false);
                                    setActiveRow(null);
                                    await runReport();
                                } catch (e) {
                                    const errMsg =
                                        e?.response?.data?.message ||
                                        e?.response?.data?.Message ||
                                        'Tek fazla mesai işlemi başarısız.';
                                    toast.error(errMsg);
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="mb-3">
                                        <label className="form-label">Onaylı Fazla Mesai</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div>
                                                <Field
                                                    type="number"
                                                    name="saat"
                                                    className="form-control"
                                                    style={{ width: 80 }}
                                                    min="0"
                                                />
                                                <small className="text-muted">Saat</small>
                                            </div>
                                            <span>:</span>
                                            <div>
                                                <Field
                                                    type="number"
                                                    name="dakika"
                                                    className="form-control"
                                                    style={{ width: 80 }}
                                                    min="0"
                                                    max="59"
                                                />
                                                <small className="text-muted">Dakika</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Açıklama</label>
                                        <Field
                                            as="textarea"
                                            name="aciklama"
                                            className="form-control"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => {
                                                setTekFmModalOpen(false);
                                                setActiveRow(null);
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            Vazgeç
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <span className="spinner-border spinner-border-sm me-1" />
                                            ) : (
                                                <i className="icon-checkmark3 me-1" />
                                            )}
                                            Kaydet
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    )}
                </ModalBody>
            </Modal>
        </Layout>
    );
}

