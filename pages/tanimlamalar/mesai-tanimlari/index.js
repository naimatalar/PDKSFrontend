import React, { useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import MesaiPeriyodlariTanimlama from './components/MesaiPeriyodlariTanimlama';
import MesaiBirimleriTanimlama from './components/MesaiBirimleriTanimlama';
import MesaiProgramiTanimlama from './components/MesaiProgramiTanimlama';
import DinlenmelerTanimlama from './components/DinlenmelerTanimlama';

const TABS = [
    { id: 'mesai-birimleri', label: 'Mesai Birimleri', icon: 'fas fa-th-list', Component: MesaiBirimleriTanimlama },
    { id: 'mesai-programi', label: 'Mesai Programı', icon: 'icon-calendar52', Component: MesaiProgramiTanimlama },
    { id: 'dinlenmeler', label: 'Dinlenmeler', icon: 'icon-coffee', Component: DinlenmelerTanimlama },
    { id: 'mesai-periyodlari', label: 'Mesai Periyotları', icon: 'icon-alarm', Component: MesaiPeriyodlariTanimlama },
];

export default function MesaiTanimlariIndex() {
    const [activeTab, setActiveTab] = useState('mesai-birimleri');

    return (
        <Layout>
            <PageHeader
                title="Mesai Tanımlamaları"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/mesai-tanimlari', name: 'Mesai Tanımlamaları' },
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
