import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';

export default function SorguRaporuIndex() {
    const [raporList, setRaporList] = useState([]);
    const [seciliSira, setSeciliSira] = useState(0);
    const [sonucData, setSonucData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
    const [editRapor, setEditRapor] = useState(null);

    useEffect(() => {
        loadRaporlar();
    }, []);

    const loadRaporlar = async () => {
        setListLoading(true);
        try {
            const res = await GetWithToken('CustomReport/GetAll');
            const list = res?.data?.data || [];
            setRaporList(list);
            if (list.length > 0 && seciliSira === 0) setSeciliSira(list[0].sira ?? list[0].Sira);
        } catch (e) {
            console.error('Raporlar yüklenemedi', e);
        } finally {
            setListLoading(false);
        }
    };

    const raporuGetir = async () => {
        if (!seciliSira || seciliSira === 0) return;
        setLoading(true);
        setSonucData(null);
        try {
            const res = await PostWithToken('CustomReport/Execute', { sira: seciliSira });
            setSonucData(res?.data?.data || []);
        } catch (e) {
            console.error('Rapor çalıştırılamadı', e);
            if (e?.response?.data?.message) {
                alert('Hata: ' + e.response.data.message);
            } else {
                alert('Rapor çalıştırılamadı.');
            }
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditRapor(null);
        setModalMode('add');
        setModalOpen(true);
    };

    const openEditModal = async () => {
        if (!seciliSira || seciliSira === 0) {
            alert('Düzenlemek için bir rapor seçin.');
            return;
        }
        try {
            const res = await GetWithToken(`CustomReport/GetById?sira=${seciliSira}`);
            setEditRapor(res?.data?.data || null);
            setModalMode('edit');
            setModalOpen(true);
        } catch (e) {
            console.error('Rapor alınamadı', e);
        }
    };

    const handleKaydet = async (values) => {
        try {
            if (modalMode === 'add') {
                await PostWithToken('CustomReport/Create', { ad: values.ad, sorgu: values.sorgu });
                alert('Rapor eklendi.');
            } else {
                await PostWithToken('CustomReport/Update', {
                    sira: values.sira,
                    ad: values.ad,
                    sorgu: values.sorgu,
                });
                alert('Rapor güncellendi.');
            }
            setModalOpen(false);
            loadRaporlar();
        } catch (e) {
            const msg = e?.response?.data?.message || 'İşlem başarısız.';
            alert(msg);
        }
    };

    const exportToExcel = async () => {
        if (!sonucData || sonucData.length === 0) return;
        const cols = Object.keys(sonucData[0]);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sorgu Raporu');
        const headerRow = sheet.addRow(cols);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
        sonucData.forEach((row) => {
            sheet.addRow(cols.map((c) => row[c] ?? ''));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sorgu-raporu-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const raporSecenekleri = raporList.map((r) => ({
        value: r.sira ?? r.Sira,
        label: (r.ad ?? r.Ad) || `Rapor ${r.sira ?? r.Sira}`,
    }));

    const basliklar = sonucData && sonucData.length > 0 ? Object.keys(sonucData[0]) : [];

    return (
        <Layout>
            <PageHeader
                title="Sorgu Raporu"
                map={[
                    { url: 'raporlar', name: 'Raporlar' },
                    { url: 'raporlar/sorgu-raporu', name: 'Sorgu Raporu' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="mb-0">Sorgu Raporu</h5>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={openAddModal}
                                disabled={listLoading}
                            >
                                <i className="icon-plus22 me-1" />
                                Yeni Rapor
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={openEditModal}
                                disabled={listLoading || !seciliSira}
                            >
                                <i className="icon-pencil7 me-1" />
                                Düzenle
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label">Rapor Seçin</label>
                                <ReactSelect
                                    options={raporSecenekleri}
                                    value={raporSecenekleri.find((x) => x.value === seciliSira) || null}
                                    onChange={(o) => setSeciliSira(o?.value ?? 0)}
                                    isDisabled={listLoading}
                                    isClearable={false}
                                    placeholder="Rapor seçin..."
                                />
                            </div>
                            <div className="col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={raporuGetir}
                                    disabled={loading || !seciliSira || listLoading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-1" />
                                    ) : (
                                        <i className="icon-play3 me-1" />
                                    )}
                                    Raporu Getir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {sonucData !== null && (
                    <div className="card mt-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
                            <h5 className="mb-0 fw-semibold">Rapor Sonucu ({sonucData.length} kayıt)</h5>
                            <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={exportToExcel}
                                disabled={!sonucData?.length}
                            >
                                <i className="icon-file-excel me-1" />
                                Excel Aktar
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <div
                                style={{
                                    overflowX: 'auto',
                                    overflowY: 'auto',
                                    maxHeight: 'calc(100vh - 340px)',
                                }}
                            >
                                {sonucData.length > 0 ? (
                                    <table
                                        className="table table-bordered table-hover table-striped table-sm mb-0"
                                        style={{
                                            minWidth: 'max-content',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                {basliklar.map((h) => (
                                                    <th
                                                        key={h}
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            minWidth: 100,
                                                            padding: '12px 14px',
                                                            backgroundColor: '#4472C4',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            borderColor: '#3a62a8',
                                                            position: 'sticky',
                                                            top: 0,
                                                            zIndex: 1,
                                                            boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)',
                                                        }}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sonucData.map((row, idx) => (
                                                <tr key={idx}>
                                                    {basliklar.map((col) => (
                                                        <td
                                                            key={col}
                                                            style={{
                                                                padding: '10px 14px',
                                                                verticalAlign: 'middle',
                                                            }}
                                                        >
                                                            {String(row[col] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-5 text-center text-muted">
                                        <i className="icon-list text-muted d-block mb-2" style={{ fontSize: '2rem', opacity: 0.5 }} />
                                        Kayıt bulunamadı.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                    {modalMode === 'add' ? 'Yeni Rapor Ekle' : 'Rapor Düzenle'}
                </ModalHeader>
                <ModalBody>
                    <Formik
                        initialValues={{
                            sira: editRapor?.sira ?? editRapor?.Sira ?? 0,
                            ad: editRapor?.ad ?? editRapor?.Ad ?? '',
                            sorgu: editRapor?.sorgu ?? editRapor?.Sorgu ?? '',
                        }}
                        enableReinitialize
                        onSubmit={handleKaydet}
                    >
                        {({ values, handleChange, handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                                {modalMode === 'edit' && (
                                    <input type="hidden" name="sira" value={values.sira} readOnly />
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Rapor Adı</label>
                                    <Field
                                        name="ad"
                                        type="text"
                                        value={values.ad}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Rapor adı"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">SQL Sorgusu</label>
                                    <Field
                                        as="textarea"
                                        name="sorgu"
                                        value={values.sorgu}
                                        onChange={handleChange}
                                        className="form-control font-monospace"
                                        rows={8}
                                        placeholder="SELECT ..."
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                        İptal
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Kaydet
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
        </Layout>
    );
}
