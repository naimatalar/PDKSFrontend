import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
const isBrowser = typeof window !== "undefined";
export default async function PermissionCheck( pagename  ) {


    if (isBrowser) {
        if (pagename) {

            var d = await GetWithToken("PermissionManager/FrontEndPermissionCheck/" + pagename).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            return d.isError;
        } else {
            const re = window.location.pathname.split("/");
            var d = await GetWithToken("PermissionManager/FrontEndPermissionCheck/" + re[re.length - 1]).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            return d.isError;
        }





    }

}