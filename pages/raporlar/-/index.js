import Layout from "../../../layout/layout";
import PageHeader from "../../../layout/pageheader";


export default function Index()
 {
   
   return         <Layout>
            <PageHeader
                title="Raporlar"
                map={[
                    { url: 'Raporlar', name: 'Raporlar' }

                ]}
            >


            </PageHeader>
            <main className="constructor-p" style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, sans-serif",
              
                color: "white",
                textAlign: "center",
                padding: 20
            }}>
                <div>
                    <h1 style={{ fontSize: 42, marginBottom: 10 }}>🚧 Yapım Aşamasında</h1>
                    <p style={{ opacity: 0.7, fontSize: 18 }}>
                        Site üzerinde çalışıyoruz.<br />

                    </p>

                    <div style={{ marginTop: 30, fontSize: 14, opacity: 0.5 }}>
                        © {new Date().getFullYear()}
                    </div>
                </div>
            </main>
        </Layout> 

}