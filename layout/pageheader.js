import Head from 'next/head';
import React from 'react';

export default function PageHeader({title="",map=[{url:"",name:""}]}) {

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="page-header page-header-light">


                <div className="breadcrumb-line breadcrumb-line-light header-elements-md-inline">
                    <div className="d-flex">
                        <div className="breadcrumb">
                            <a href="/dashboard" className="breadcrumb-item"><i className="icon-home2 mr-2"></i> {title}</a>

                            {map?.map((item, key) => {
                                if (item.name=="") {
                                    return null
                                }
                                if (item.url == "") {
                                    return <span key={key} className="breadcrumb-item active">{item.name}</span>
                                } else {

                                    return <a key={key} href={item.url} className="breadcrumb-item"> {item.name}</a>


                                }

                            })}


                        </div>

                        <a href="#" className="header-elements-toggle text-default d-md-none"><i className="icon-more"></i></a>
                    </div>

                    <div className="header-elements d-none">

                    </div>
                </div>
            </div>
        </>
    )

}