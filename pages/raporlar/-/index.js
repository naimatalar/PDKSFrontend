import Link from 'next/link';
import Layout from "../../../layout/layout";
import PageHeader from "../../../layout/pageheader";


export default function Index()
 {
   
   return         <Layout>
            <PageHeader
                title="Raporlar"
                map={[
                    { url: 'raporlar', name: 'Raporlar' }

                ]}
            />

            <div className="content p-4">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/aylik-raporlama" className="card card-body text-decoration-none">
                            <h5 className="card-title">Aylık Rapor</h5>
                            <p className="card-text text-muted">Personel günlük giriş-çıkış, fazla/eksik mesai özeti</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/sorgu-raporu" className="card card-body text-decoration-none">
                            <h5 className="card-title">Sorgu Raporu</h5>
                            <p className="card-text text-muted">Özel SQL sorguları ile dinamik rapor oluşturma</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/giris-cikis-raporu" className="card card-body text-decoration-none">
                            <h5 className="card-title">Giriş Çıkış Raporu</h5>
                            <p className="card-text text-muted">Personel günlük giriş-çıkış saatleri raporu</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/gunluk-rapor" className="card card-body text-decoration-none">
                            <h5 className="card-title">Günlük Rapor</h5>
                            <p className="card-text text-muted">Seçilen gün için personel giriş-çıkış özeti</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/gcfarkraporu" className="card card-body text-decoration-none">
                            <h5 className="card-title">G/C Fark Raporu</h5>
                            <p className="card-text text-muted">Personel giriş-çıkış fark raporu</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/ilk-son-raporu" className="card card-body text-decoration-none">
                            <h5 className="card-title">İlk Son Raporu</h5>
                            <p className="card-text text-muted">Personel ilk giriş son çıkış raporu</p>
                        </Link>
                    </div>
                    <div className="col-md-4 mb-3">
                        <Link href="/raporlar/aylik-ilk-son-raporu" className="card card-body text-decoration-none">
                            <h5 className="card-title">Aylık İlk Son Raporu</h5>
                            <p className="card-text text-muted">Personel haftalık mesai, eksik ve fazla mesai özeti</p>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout> 

}