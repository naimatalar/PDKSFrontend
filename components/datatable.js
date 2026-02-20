import React, { cloneElement, useEffect, useState } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import { confirmAlert } from 'react-confirm-alert';
import ReactPaginate from 'react-paginate';
import { PriceSplitter } from './pricesptitter';

export default function DataTable({ GetAllData, Data, Refresh = null, Title, Description, Headers = [[] || { text: undefined, header: undefined, dynamicButton: undefined, onClick: undefined }], DataUrl, Pagination = undefined, UseGetPagination = false, HeaderButton = { text: "", action: (e) => { } }, EditButton = (e) => { }, DeleteButton = (e) => { }, HideButtons = false, NoDataPlaceholder }) {

    const [data, setData] = useState(Data)
    const [toggleActions, setToggleActions] = useState({ toggle: false, key: 0 })
    const [selectedPage, setSelectedPage] = useState(1)
    const [pagination, setPagination] = useState()
    const [loading, setLoading] = useState(true)

    const toggleAction = (key) => setToggleActions({ toggle: !toggleActions.toggle, key: key })
    useEffect(() => {
        if (!Data) {
            start()
        }

    }, [Refresh])
    const start = async () => {
        if (DataUrl) {


            if (Pagination) {
                const paginationParams = { PageNumber: Pagination.pageNumber || 1, PageSize: Pagination.pageSize || 20 };
                const d = UseGetPagination
                    ? await GetWithToken(DataUrl, paginationParams).then(x => x.data)
                    : await PostWithToken(DataUrl, Pagination).then(x => x.data);
                setSelectedPage(paginationParams.PageNumber)
                setPagination(d.data.totalCount);
                setData(d.data.list)
                setLoading(false)
                if (GetAllData) {
                    GetAllData(d.data.list)
                }

            } else {
                var d = await GetWithToken(DataUrl).then(x => { return x.data })
                setData(d.data)
                setLoading(false)
                if (GetAllData) {
                    GetAllData(d.data)
                }
            }
        }else{
            setLoading(false)
        }

        // if (d.data?.pageNumber) {


        //     setPagination(d.data.totalCount);
        // } else {

        // }


    }
    const paginationClick = async (data) => {

        setSelectedPage(data.selected + 1)
        Pagination.pageNumber = data.selected + 1
        const paginationParams = { PageNumber: Pagination.pageNumber, PageSize: Pagination.pageSize || 20 };
        const d = UseGetPagination
            ? await GetWithToken(DataUrl, paginationParams).then(x => x.data)
            : await PostWithToken(DataUrl, Pagination).then(x => x.data);


        setData(d.data.list)
    }
    const deleteButtonFunc = async (data) => {

        confirmAlert({
            title: 'Dikkat',
            message: 'Kayıt Silinecek Onaylıyor Musunuz.',
            buttons: [
                {
                    label: 'Evet',
                    onClick: () => DeleteButton(data)
                },
                {
                    label: 'Hayır',
                    onClick: () => { }
                }
            ]
        })

    }

    return (
        <div className='datatable-pro'>
            {Title && <div className="datatable-header">
                <h5 className="datatable-title">{Title}</h5>
                {HeaderButton?.text != "" && (
                    <button className="datatable-header-btn" onClick={HeaderButton.action}>
                        <i className='icon-plus22'></i>
                        <span>{HeaderButton.text}</span>
                    </button>
                )}
            </div>}

            {Description && <div className="datatable-description">{Description}</div>}

            <div className="datatable-table-wrap">
            <table className="datatable-table">
                <thead>
                    <tr>
                        {
                            Headers?.map((item, key) => {


                                if (item?.header) {
                                    return (<th key={key}>{item.header}</th>)
                                } else {
                                    return (<th key={key}>{item[1]}</th>)

                                }
                            })
                        }
                        {HideButtons != true &&
                            <th className="text-center">İşlemler</th>

                        }
                    </tr>
                </thead>
                <tbody>
                    {data?.length == 0 && <tr>
                        <td colSpan={Headers?.length + 1} className='datatable-empty'>
                            <div className="datatable-empty-icon"><i className="icon-inbox"></i></div>
                            <span>{NoDataPlaceholder || "Kayıt bulunamadı"}</span>
                        </td>
                    </tr>}
                    {/* {loading && <tr>
                        <td colSpan={Headers?.length + 1} className='text-center'>
                            <b>{"Yükleniyor..."}</b>
                        </td>
                    </tr>} */}

        
                    {data?.map((item, key) => {

                        return <tr key={key + 5} id={key}>
                            {Headers?.map((jitem, jkey) => {
                                var cs = jitem[2]?.colspan || 0

                                // jitem.length jkey

                                if (jitem?.header) {

                                    if (jitem?.dynamicButton) {
                                        return <td style={{ textAlign: "center" }} colSpan={cs} key={jkey + key}>{jitem?.dynamicButton(item)} </td>
                                    }



                                    return (<td colSpan={cs} key={jkey + key}><button className={'btn btn-sm btn-info'} onClick={() => { jitem.onClick(item) }}>{jitem.text}</button> {jitem.button}</td>)
                                } else {

                                    if (jitem[0].includes(".")) {
                                        var splt = jitem[0].split(".")
                                        var tbls = item[splt[0]].map((item, key) => {
                                            var vll = jitem[2].split("|")

                                            var endValue = item[vll[0]]

                                            if (vll.length > 1) {
                                                if (vll[1] == "price") {
                                                    endValue = PriceSplitter(item[vll[0]])
                                                }
                                            }
                                            return <div key={key} className='price-table-view'>{endValue + " " + item[jitem[3]]}</div>
                                        })

                                        if (tbls != "") {

                                            return (<td colSpan={cs} key={jkey + key}>{tbls}</td>)

                                        } else {
                                            return (<td colSpan={cs} key={jkey + key}>{" - "}</td>)

                                        }
                                        // return (<td key={jkey + key}>{tbls}</td>)

                                    } else {
                                        let cnt = 0;
                                        cnt++;
                                        if (item[jitem[0]]) {



                                            return (<td colSpan={cs} key={jkey + key}>{(jitem[2] == "money" && PriceSplitter(item[jitem[0]]) + " " + jitem[3]) || item[jitem[0]]}</td>)


                                        } else {
                                            return (<td colSpan={cs} key={jkey + key} className="text-center"><span className="empty-cell">{" - "}</span></td>)

                                        }

                                    }
                                }

                            })}  {HideButtons != true &&
                                <td className="datatable-actions-cell">
                                    <Dropdown isOpen={toggleActions.toggle && toggleActions.key == key} toggle={() => { toggleAction(key); }}>
                                        <DropdownToggle className="datatable-actions-toggle">
                                            <i className="icon-menu9"></i>
                                        </DropdownToggle>
                                            <DropdownMenu>
                                                <button className='btn btn-outline-danger' onClick={() => { deleteButtonFunc(item) }}><i className="icon-trash"></i> Sil</button>
                                                <button className='btn btn-outline-success' onClick={() => { EditButton(item) }}><i className="icon-pencil"></i> Düzenle</button>
                                            </DropdownMenu>
                                        </Dropdown>
                                </td>
                            }
                        </tr>

                    })}

                </tbody>
            </table>
            </div>
            {data?.length > 0 && Pagination && (
            <div className="datatable-pagination-wrap">
                <ReactPaginate
                    className="pager-base"
                    pageLinkClassName="pager-list"
                    breakLabel="..."
                    nextLabel={<><i className='fa fa-arrow-right'></i> Sonraki</>}
                    onPageChange={paginationClick}
                    pageRangeDisplayed={5}
                    pageCount={pagination}
                    previousLabel={<><i className='fa fa-arrow-left'></i> Önceki</>}
                    renderOnZeroPageCount={null}
                />
            </div>
            )}
        </div>

    )

}