import React, { useState } from 'react';
import Layout from '../../layout/layout';
import PageHeader from '../../layout/pageheader';
import DataTable from '../../components/datatable';
import { GetWithToken } from '../api/crud';

export default function MonitorIndex() {
    const [refresh, setRefresh] = useState(null);

    const formatTarih = (val) => {
        if (!val) return '-';
        try {
            const d = new Date(val);
            return d.toLocaleString('tr-TR');
        } catch {
            return val;
        }
    };

    return (
        <Layout>
            <PageHeader
                title="Monitor"
                map={[{ url: 'monitor', name: 'Monitor' }]}
            />
            <div className="content pr-3 pl-3">
                <div className="card">
                    <DataTable
                        Refresh={refresh}
                        DataUrl="DahuaAccess/RecentEvents"
                        Data={null}
                        Pagination={{ pageNumber: 1, pageSize: 20 }}
                        UseGetPagination
                        Headers={[
                            ['terminalName', 'Terminal'],
                            ['personName', 'Personel'],
                            ['userId', 'User ID'],
                            { header: 'Tarih/Saat', dynamicButton: (item) => formatTarih(item.eventtime) },
                            
                            { header: 'Event Açıklaması', dynamicButton: (item) => item?.eventCodeDesc || item?.description || '-' },
                        ]}
                        Title="Kart Okutma Geçmişi"
                        Description="Dahua terminallerinden gelen son kart okutma olayları. En güncel kayıtlar üstte listelenir."
                        HeaderButton={{ text: 'Yenile', action: () => setRefresh(new Date()) }}
                        HideButtons
                        NoDataPlaceholder="Henüz kayıt yok."
                    />
                </div>
            </div>
        </Layout>
    );
}
