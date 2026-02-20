import React, { useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import FirmaTanimlama from './components/FirmaTanimlama';
import BolumTanimlama from './components/BolumTanimlama';
import DirektorlukTanimlama from './components/DirektorlukTanimlama';
import GorevTanimlama from './components/GorevTanimlama';
import PozisyonTanimlama from './components/PozisyonTanimlama';
import PuantajTanimlama from './components/PuantajTanimlama';
import YakaTanimlama from './components/YakaTanimlama';
import AltFirmaTanimlama from './components/AltFirmaTanimlama';
import TerminalGrupTanimlama from './components/TerminalGrupTanimlama';
import MesaiPeriyodlariTanimlama from './components/MesaiPeriyodlariTanimlama';

const TABS = [
    { id: 'firma', label: 'Firma', icon: 'icon-office', Component: FirmaTanimlama },
    { id: 'bolum', label: 'Bölüm', icon: 'icon-folder', Component: BolumTanimlama },
    { id: 'direktorluk', label: 'Direktörlük', icon: 'icon-briefcase', Component: DirektorlukTanimlama },
    { id: 'gorev', label: 'Görev', icon: 'icon-task', Component: GorevTanimlama },
    { id: 'pozisyon', label: 'Pozisyon', icon: 'icon-user-tie', Component: PozisyonTanimlama },
    { id: 'puantaj', label: 'Puantaj', icon: 'icon-calendar', Component: PuantajTanimlama },
    { id: 'yaka', label: 'Yaka', icon: 'icon-medal', Component: YakaTanimlama },
    { id: 'alt-firma', label: 'Alt Firma', icon: 'icon-store2', Component: AltFirmaTanimlama },
    { id: 'terminal-grup', label: 'Terminal Grubu', icon: 'icon-lan', Component: TerminalGrupTanimlama },
    { id: 'mesai-periyodlari', label: 'Mesai Periyotları', icon: 'icon-alarm', Component: MesaiPeriyodlariTanimlama },
];

export default function TanimlamalarIndex() {
    const [activeTab, setActiveTab] = useState('firma');

    return (
        <Layout>
            <PageHeader
                title="Sicil Tanımlamaları"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="tanimlamalar-tabs">
                    <div className="tanimlamalar-card card">
                        <div className="card-header border-0 p-0">
                            <Nav tabs className="nav-tabs tanimlamalar-nav">
                                {TABS.map((tab) => (
                                    <NavItem key={tab.id}>
                                        <NavLink
                                            className={activeTab === tab.id ? 'active' : ''}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <i className={tab.icon}></i>
                                            <span>{tab.label}</span>
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>
                        </div>
                        <div className="tanimlamalar-content card-body">
                            <TabContent activeTab={activeTab}>
                                {TABS.map((tab) => {
                                    const TabComponent = tab.Component;
                                    return (
                                        <TabPane key={tab.id} tabId={tab.id} className="tab-pane">
                                            {activeTab === tab.id && <TabComponent />}
                                        </TabPane>
                                    );
                                })}
                            </TabContent>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
