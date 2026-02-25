import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { GetWithToken } from '../../api/crud';
import ExcelJS from 'exceljs';

export default function CalismaKayitlariModal({
    isOpen,
    toggle,
    sicilId,
    adSoyad,
    baslangic,
    bitis,
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const printBodyRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !sicilId || !baslangic || !bitis) return;
        setLoading(true);
        setData(null);
        const bas = baslangic.includes('-') ? baslangic : baslangic.split('.').reverse().join('-');
        const bit = bitis.includes('-') ? bitis : bitis.split('.').reverse().join('-');
        GetWithToken('ToplamSure/GetSicilDailyReport', {
            sicilId,
            baslangicTarihi: bas,
            bitisTarihi: bit,
        })
            .then((res) => {
                const payload = res?.data?.data ?? res?.data ?? res;
                setData(payload);
            })
            .catch((e) => {
                console.error('Çalışma kayıtları yüklenemedi', e);
                setData(null);
            })
            .finally(() => setLoading(false));
    }, [isOpen, sicilId, baslangic, bitis]);

    const handleYazdir = () => {
        const content = printBodyRef.current;
        if (!content) return;
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Çalışma Kayıtları</title>' +
                '<style>body{font-family:MS Sans Serif,sans-serif;font-size:10.39px;text-align:center;background:#fff;margin:0;padding:8px;} ' +
                'table{border-collapse:collapse;margin:0 auto;} td,th{border:1px solid #000;padding:3px;} .table-bordered{border-width:3px;}</style></head><body>' +
                content.innerHTML +
                '</body></html>'
        );
        doc.close();
        const win = iframe.contentWindow;
        const removeIframe = () => {
            try {
                if (iframe.parentNode) document.body.removeChild(iframe);
            } catch (_) {}
        };
        win.onafterprint = removeIframe;
        win.focus();
        win.print();
        setTimeout(removeIframe, 5000);
    };

    const handleExcel = async () => {
        if (!data?.gunlukListe?.length) return;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Çalışma Kayıtları');
        sheet.columns = [
            { header: 'Tarih', key: 'tarih', width: 12 },
            { header: 'Giris', key: 'giris', width: 8 },
            { header: 'GT', key: 'gt', width: 6 },
            { header: 'Cikis', key: 'cikis', width: 8 },
            { header: 'CT', key: 'ct', width: 6 },
            { header: 'MS', key: 'ms', width: 10 },
            { header: 'NM', key: 'nm', width: 10 },
            { header: 'FM', key: 'fm', width: 12 },
            { header: 'GZ', key: 'gz', width: 8 },
            { header: 'OFM', key: 'ofm', width: 10 },
            { header: 'RM', key: 'rm', width: 10 },
            { header: 'Aciklama', key: 'aciklama', width: 22 },
            { header: 'EEksikMesai', key: 'eksikMesai', width: 12 },
            { header: 'IZS', key: 'izs', width: 10 },
            { header: 'GV', key: 'gv', width: 10 },
            { header: 'HK', key: 'hk', width: 10 },
        ];
        sheet.addRows(data.gunlukListe);
        const buf = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CalismaKayitlari_${adSoyad || sicilId}_${baslangic}_${bitis}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    const gunlukListe = data?.gunlukListe ?? [];
    const toplamMs = gunlukListe.reduce((s, r) => {
        const [h, m] = (r.ms || '00:00').split(':').map(Number);
        return s + (h || 0) * 60 + (m || 0);
    }, 0);
    const toplamNm = gunlukListe.reduce((s, r) => {
        const [h, m] = (r.nm || '00:00').split(':').map(Number);
        return s + (h || 0) * 60 + (m || 0);
    }, 0);
    const toplamHk = gunlukListe.reduce((s, r) => s + (r.hkDakika || 0), 0);
    const fmt = (d) => {
        const h = Math.floor(d / 60);
        const m = d % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable className="calisma-kayitlari-modal">
            <ModalHeader toggle={toggle}>
                Çalışma Kayıtları {adSoyad ? ` - ${adSoyad}` : ''}
            </ModalHeader>
            <ModalBody style={{ backgroundColor: '#fff' }}>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                    <button type="button" className="btn btn-warning btn-sm" onClick={handleYazdir}>
                        <i className="fa fa-print me-1" />
                        Yazdır
                    </button>
                    <button type="button" className="btn btn-success btn-sm" onClick={handleExcel} disabled={!gunlukListe.length}>
                        <i className="fa fa-file-excel me-1" />
                        Excele Gönder
                    </button>
                </div>

                <div ref={printBodyRef}>
                {loading ? (
                    <div className="text-center py-5">
                        <span className="spinner-border spinner-border-sm me-2" />
                        Yükleniyor...
                    </div>
                ) : !data ? (
                    <div className="text-center text-muted py-4">Veri yüklenemedi.</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table
                                id="pdks-calisma"
                                className="table table-bordered table-sm"
                                style={{
                                    backgroundColor: '#e0e0e0',
                                    borderWidth: 3,
                                    fontSize: '10.39px',
                                    textAlign: 'center',
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td colSpan={16} style={{ textAlign: 'center' }}>
                                            {data.sicilAd || adSoyad || `Sicil #${sicilId}`} ({data.baslangic} - {data.bitis})
                                        </td>
                                    </tr>
                                    <tr style={{ backgroundColor: '#dfdfdf' }}>
                                        <td>Tarih</td>
                                        <td>Giris</td>
                                        <td>GT</td>
                                        <td>Cikis</td>
                                        <td>CT</td>
                                        <td>MS</td>
                                        <td>NM</td>
                                        <td>FM</td>
                                        <td>GZ</td>
                                        <td>OFM</td>
                                        <td>RM</td>
                                        <td>Aciklama</td>
                                        <td>EEksikMesai</td>
                                        <td>IZS</td>
                                        <td>GV</td>
                                        <td>HK</td>
                                    </tr>
                                    {gunlukListe.map((row, i) => (
                                        <tr key={i} style={{ backgroundColor: '#ffffff' }}>
                                            <td>{row.tarih}</td>
                                            <td>{row.giris || ''}</td>
                                            <td>{row.gt ?? 0}</td>
                                            <td>{row.cikis || ''}</td>
                                            <td>{row.ct ?? 0}</td>
                                            <td>{row.ms || '00:00'}</td>
                                            <td>{row.nm || '00:00'}</td>
                                            <td>{row.fm || '00:00 (0)'}</td>
                                            <td>{row.gz || '00:00'}</td>
                                            <td>{row.ofm || '00:00'}</td>
                                            <td>{row.rm || '00:00'}</td>
                                            <td>{row.aciklama || ''}</td>
                                            <td>{row.eksikMesai || '00:00'}</td>
                                            <td>{row.izs || '00:00'}</td>
                                            <td>{row.gv || '00:00'}</td>
                                            <td
                                                style={
                                                    row.hkDakika > 0
                                                        ? { backgroundColor: '#80ff00' }
                                                        : {}
                                                }
                                            >
                                                {row.hk || '00:00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row mt-3 g-3">
                            <div className="col-md-6">
                                <table
                                    className="table table-bordered table-sm"
                                    style={{
                                        backgroundColor: '#e0e0e0',
                                        borderWidth: 3,
                                        fontSize: '10px',
                                        minWidth: 280,
                                    }}
                                >
                                    <tbody>
                                        <tr style={{ backgroundColor: '#d4d0c8', textAlign: 'center' }}>
                                            <td colSpan={2}>Puantaj Bilgileri</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#d4d0c8' }}>
                                            <td>Açıklama</td>
                                            <td>Saat</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Toplam Mesai Süresi</td>
                                            <td style={{ textAlign: 'center' }}>{fmt(toplamMs)}</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Toplam Normal Mesai</td>
                                            <td style={{ textAlign: 'center' }}>{fmt(toplamNm)}</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Hafta Tatili</td>
                                            <td style={{ textAlign: 'center' }}>- Gün</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Resmi Tatil</td>
                                            <td style={{ textAlign: 'center' }}>0 Gün</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Toplam Resmi Tatil Mesaisi</td>
                                            <td style={{ textAlign: 'center' }}>00:00</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Fazla Mesai (0)</td>
                                            <td style={{ textAlign: 'center' }}>00:00 (OFM 00:00)</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Fazla Mesai (150)</td>
                                            <td style={{ textAlign: 'center' }}>00:00 (OFM 00:00)</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Eksik Mesai (0)</td>
                                            <td style={{ textAlign: 'center' }}>{fmt(Math.max(0, toplamNm - toplamMs))}</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ textAlign: 'left' }}>Gelinmeyen Gün:</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {gunlukListe.filter((r) => !r.giris && !r.cikis).length} Gün (00:00 saat)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <table
                                    className="table table-bordered table-sm"
                                    style={{
                                        backgroundColor: '#e0e0e0',
                                        borderWidth: 3,
                                        fontSize: '10px',
                                        minWidth: 280,
                                    }}
                                >
                                    <tbody>
                                        <tr style={{ backgroundColor: '#d4d0c8', textAlign: 'center' }}>
                                            <td colSpan={3}>İzin Bilgileri</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#d4d0c8' }}>
                                            <td>Açıklama</td>
                                            <td>Süre</td>
                                            <td>Tip</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>
                                                -
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
                </div>
            </ModalBody>
        </Modal>
    );
}
