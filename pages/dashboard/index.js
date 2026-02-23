import { useState, useEffect } from 'react';
import Layout from '../../layout/layout';
import PageHeader from '../../layout/pageheader';
import { GetWithToken } from '../api/crud';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const CHART_COLORS = ['#239A8F', '#17a2b8', '#28a745', '#ffc107', '#fd7e14', '#e83e8c', '#6f42c1', '#20c997'];

export default function Index() {
    const [stats, setStats] = useState(null);
    const [dailyPasses, setDailyPasses] = useState([]);
    const [hourlyPasses, setHourlyPasses] = useState([]);
    const [passesByTerminal, setPassesByTerminal] = useState([]);
    const [personelByFirma, setPersonelByFirma] = useState([]);
    const [passesByEventType, setPassesByEventType] = useState([]);
    const [dailyGirisCikis, setDailyGirisCikis] = useState([]);

    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [loadingHourly, setLoadingHourly] = useState(false);
    const [loadingTerminal, setLoadingTerminal] = useState(false);
    const [loadingFirma, setLoadingFirma] = useState(false);
    const [loadingEventType, setLoadingEventType] = useState(false);
    const [loadingGirisCikis, setLoadingGirisCikis] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadStats = async () => {
        setLoadingStats(true);
        try {
            const res = await GetWithToken('Dashboard/Stats');
            setStats(res?.data || null);
        } catch (e) {
            console.error('Dashboard Stats yüklenemedi', e);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadDailyPasses = async () => {
        setLoadingDaily(true);
        try {
            const res = await GetWithToken('Dashboard/DailyPasses');
            setDailyPasses(res?.data || []);
        } catch (e) {
            console.error('Dashboard DailyPasses yüklenemedi', e);
            setDailyPasses([]);
        } finally {
            setLoadingDaily(false);
        }
    };

    const loadHourlyPasses = async () => {
        setLoadingHourly(true);
        try {
            const res = await GetWithToken('Dashboard/HourlyPassesToday');
            setHourlyPasses(res?.data || []);
        } catch (e) {
            console.error('Dashboard HourlyPassesToday yüklenemedi', e);
            setHourlyPasses([]);
        } finally {
            setLoadingHourly(false);
        }
    };

    const loadPassesByTerminal = async () => {
        setLoadingTerminal(true);
        try {
            const res = await GetWithToken('Dashboard/PassesByTerminal');
            setPassesByTerminal(res?.data || []);
        } catch (e) {
            console.error('Dashboard PassesByTerminal yüklenemedi', e);
            setPassesByTerminal([]);
        } finally {
            setLoadingTerminal(false);
        }
    };

    const loadPersonelByFirma = async () => {
        setLoadingFirma(true);
        try {
            const res = await GetWithToken('Dashboard/PersonelByFirma');
            setPersonelByFirma(res?.data || []);
        } catch (e) {
            console.error('Dashboard PersonelByFirma yüklenemedi', e);
            setPersonelByFirma([]);
        } finally {
            setLoadingFirma(false);
        }
    };

    const loadPassesByEventType = async () => {
        setLoadingEventType(true);
        try {
            const res = await GetWithToken('Dashboard/PassesByEventType');
            setPassesByEventType(res?.data || []);
        } catch (e) {
            console.error('Dashboard PassesByEventType yüklenemedi', e);
            setPassesByEventType([]);
        } finally {
            setLoadingEventType(false);
        }
    };

    const loadDailyGirisCikis = async () => {
        setLoadingGirisCikis(true);
        try {
            const res = await GetWithToken('Dashboard/DailyGirisCikis');
            setDailyGirisCikis(res?.data || []);
        } catch (e) {
            console.error('Dashboard DailyGirisCikis yüklenemedi', e);
            setDailyGirisCikis([]);
        } finally {
            setLoadingGirisCikis(false);
        }
    };

    const loadDashboard = async () => {
        loadStats();
        loadDailyGirisCikis();
        loadDailyPasses();
        loadPassesByEventType();
        loadHourlyPasses();
        loadPassesByTerminal();
        loadPersonelByFirma();
    };

    const renderStatValue = (loadingState, value) => {
        if (loadingState) {
            return (
                <span className="d-inline-flex align-items-center">
                    <span className="spinner-border spinner-border-sm text-light mr-2" role="status" />
                    Yükleniyor
                </span>
            );
        }
        return value ?? 0;
    };

    const renderChartOrLoader = (loadingState, chartNode, hasData, height = 280) => {
        if (loadingState) {
            return (
                <div style={{ height }} className="d-flex align-items-center justify-content-center text-muted">
                    <span className="spinner-border spinner-border-sm text-primary mr-2" /> Yükleniyor...
                </div>
            );
        }
        if (!hasData) {
            return (
                <div style={{ height }} className="d-flex align-items-center justify-content-center text-muted">
                    Veri bulunamadı
                </div>
            );
        }
        return <div style={{ height }}>{chartNode}</div>;
    };

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
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.totalPersonel)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Geçiş</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.bugunGecis)}</h3>
                            </div>
                        </div>
                    </div>
                    {/* <div className="col-sm-6 col-xl">
                        <div className="card text-white" style={{ backgroundColor: '#239A8F' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Binada Mevcut</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.binadaMevcut)}</h3>
                            </div>
                        </div>
                    </div> */}
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Terminal</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.totalTerminal)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-warning text-dark">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün İzinli</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.bugunIzinli)}</h3>
                            </div>
                        </div>
                    </div>
                    {/* <div className="col-sm-6 col-xl">
                        <div className="card text-white" style={{ backgroundColor: '#28a745' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Giriş</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.bugunGiris)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                        <div className="card bg-danger text-white">
                            <div className="card-body">
                                <h6 className="text-uppercase mb-1 opacity-75">Bugün Çıkış</h6>
                                <h3 className="mb-0">{renderStatValue(loadingStats, stats?.bugunCikis)}</h3>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Giriş / Çıkış grafiği */}
                <div className="row">
                    <div className="col-12">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingGirisCikis,
                                    <Bar data={girisCikisChartData} options={chartOptions('Son 7 Gün Günlük Giriş / Çıkış')} />,
                                    (dailyGirisCikis?.length || 0) > 0,
                                    300
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grafikler */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingDaily,
                                    <Line data={dailyChartData} options={chartOptions('Son 7 Gün Günlük Geçiş Sayısı')} />,
                                    (dailyPasses?.length || 0) > 0
                                )}
                            </div>
                        </div>
                    </div>
                    {/* <div className="col-lg-4">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingEventType,
                                    <Doughnut data={eventChartData} options={chartOptions('Geçiş Tipi Dağılımı')} />,
                                    (passesByEventType?.length || 0) > 0
                                )}
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="row">
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingHourly,
                                    <Bar data={hourlyChartData} options={chartOptions('Bugün Saatlik Geçiş Dağılımı')} />,
                                    (hourlyPasses?.length || 0) > 0
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingTerminal,
                                    <Doughnut data={terminalChartData} options={chartOptions('Terminal Bazlı Geçiş (Son 7 Gün)')} />,
                                    (passesByTerminal?.length || 0) > 0
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6">
                        <div className="card mb-4">
                            <div className="card-body">
                                {renderChartOrLoader(
                                    loadingFirma,
                                    <Doughnut data={firmaChartData} options={chartOptions('Firma Bazlı Personel Dağılımı')} />,
                                    (personelByFirma?.length || 0) > 0
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
