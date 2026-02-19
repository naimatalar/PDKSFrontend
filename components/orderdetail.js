import React, { useState } from 'react';
import DataTable from './datatable';

export default function OrderDetail({ marketPlace,endpointType }) {
    const [refreshDatatable, setRefreshDatatable] = useState("")
    const [page, setPage] = useState(1)
    const clickData = (dd) => {
        alert(JSON.stringify(dd))
    }
console.log(endpointType)
    return (

        <div style={{
            background: "white",
            padding: "9px 0 26px 0px"
        }}>


            <DataTable Refresh={refreshDatatable} DataUrl={"MarketPlace/MarketPlaceOrderDetail/"+  endpointType +"/"+ marketPlace.id} Headers={[
                ["description", "Durum",],
                ["orderCount", "Sipariş Sayısı"],
                ["createDate", "İşlem Tarihi"],

                { text: "Detay", header: "#", onClick: clickData },

                // ["email", "E-posta"],
                // ["userName", "Kullanıcı Adı"],

            ]} Title={"İşlem Listesi"}
                Description={marketPlace.marketPlaceKind + " " + marketPlace.description + "işlem listesi"}
                HeaderButton={{ text: "", action: () => { setHiddenPassordField(false); setModelOpen(true); setInitialData(null) } }}
                HideButtons={true}
                Pagination={1}
            ></DataTable>
        </div>

    )

}