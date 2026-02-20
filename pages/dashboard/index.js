import { useState, useEffect, useRef } from 'react';
import Layout from '../../layout/layout';
import PageHeader from '../../layout/pageheader';
import { GetWithToken } from '../api/crud';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const CHART_COLORS = ['#239A8F', '#17a2b8', '#28a745', '#ffc107', '#fd7e14', '#e83e8c', '#6f42c1', '#20c997'];

export default function Index() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await GetWithToken('Dashboard/All');
            if (res?.data) setData(res.data);
        } catch (e) {
            console.error('Dashboard yüklenemedi', e);
        }
        setLoading(false);
    };

    if (loading || !data) {
        return (
            <Layout>
                <PageHeader title="Dashboard" map={[]} />
                <div className="content p-4 text-center">
                    <span className="spinner-border text-primary" /> Yükleniyor...
                </div>
            </Layout>
        );
    }

    const { stats, dailyPasses, hourlyPasses, passesByTerminal, personelByFirma, passesByEventType, dailyGirisCikis } = data || {};

    const dailyChartData = {
        labels: dailyPasses?.map(d => d.date) || [],
        datasets: [{
            label: 'Günlük Geçiş',
            data: dailyPasses?.map(d => d.count) || [],
            borderColor: '#239A8F',
            backgroundColor: 'rgba(35, 154, 143, 0.2)',
            tension: 0.3,
            fill: true
        }]
    };

    const hourlyChartData = {
        labels: hourlyPasses?.map(h => h.hour) || [],
        datasets: [{
            label: 'Saatlik Geçiş (Bugün)',
            data: hourlyPasses?.map(h => h.count) || [],
            backgroundColor: CHART_COLORS.slice(0, 14)
        }]
    };

    const terminalChartData = {
        labels: passesByTerminal?.map(t => t.terminal) || [],
        datasets: [{
            data: passesByTerminal?.map(t => t.count) || [],
            backgroundColor: CHART_COLORS
        }]
    };

    const firmaChartData = {
        labels: personelByFirma?.map(f => f.firma) || [],
        datasets: [{
            data: personelByFirma?.map(f => f.count) || [],
            backgroundColor: CHART_COLORS
        }]
    };

    const eventChartData = {
        labels: passesByEventType?.map(e => e.eventType) || [],
        datasets: [{
            data: passesByEventType?.map(e => e.count) || [],
            backgroundColor: CHART_COLORS
        }]
    };

    // Günlük giriş/çıkış (çubuk grafik: giriş ve çıkış yan yana)
    const girisCikisChartData = {
        labels: dailyGirisCikis?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Giriş',
                data: dailyGirisCikis?.map(d => d.giris) || [],
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 1
            },
            {
                label: 'Çıkış',
                data: dailyGirisCikis?.map(d => d.cikis) || [],
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: '#dc3545',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: title, font: { size: 14 } }
        }
    });

    return (
        <Layout>
            <PageHeader title="Dashboard" map={[]} />
            <div className="content p-4">
                <div className="d-flex justify-content-end mb-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={loadDashboard}>
                        <i className="icon-sync" /> Yenile
                    </button>
                </div>
                {/* Özet kartlar */}
                <div className="row mb-4">
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Toplam Personel</h6>
                                <h3 className="mb-0">{stats?.totalPersonel ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Geçiş</h6>
                                <h3 className="mb-0">{stats?.bugunGecis ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card text-white" style={{ backgroundColor: '#239A8F' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Binada Mevcut</h6>
                                <h3 className="mb-0">{stats?.binadaMevcut ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Terminal</h6>
                                <h3 className="mb-0">{stats?.totalTerminal ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-warning text-dark">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün İzinli</h6>
                                <h3 className="mb-0">{stats?.bugunIzinli ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card text-white" style={{ backgroundColor: '#28a745' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Giriş</h6>
                                <h3 className="mb-0">{stats?.bugunGiris ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-danger text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Çıkış</h6>
                                <h3 className="mb-0">{stats?.bugunCikis ?? 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giriş / Çıkış grafiği */}
                <div className="row">
                    <div className="col-12">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 300 }}>
                                    <Bar data={girisCikisChartData} options={chartOptions('Son 7 Gün Günlük Giriş / Çıkış')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grafikler */}
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    <Line data={dailyChartData} options={chartOptions('Son 7 Gün Günlük Geçiş Sayısı')} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    <Doughnut data={eventChartData} options={chartOptions('Geçiş Tipi Dağılımı')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    <Bar data={hourlyChartData} options={chartOptions('Bugün Saatlik Geçiş Dağılımı')} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    <Doughnut data={terminalChartData} options={chartOptions('Terminal Bazlı Geçiş (Son 7 Gün)')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                <div style={{ height: 280 }}>
                                    <Doughnut data={firmaChartData} options={chartOptions('Firma Bazlı Personel Dağılımı')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
