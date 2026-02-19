import React, { useEffect, useState } from 'react';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import Faq from 'react-faq-component';
import AlertFunction from './alertfunction';
function FaqCompnent({ companyId }) {
    const [faqList, setFaqList] = useState([])
    const [ansver, setAnsver] = useState()
    const [question, setQuestion] = useState()

    useEffect(() => {

        start()
    }, [])
    const start = async () => {
        var d = await GetWithToken("faq/GetFaqByCompanyId/" + companyId).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })


        var list = []
        if (d.data) {
            for (const item of d?.data) {
                list.push({ title: item.question, content: item.ansver, id: item.id })
            }
            setFaqList({ rows: list })
        }


    }
    const create = async () => {
        await PostWithToken("faq/create", { companyId: companyId, ansver: ansver, question: question }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        start()
    }

    return (
        <div className='row'>
            <div className='col-12'>
                <div className='col-12 row'>
                    <div className='col-12  mb-2 row'>
                        <textarea onChange={x => { setQuestion(x.target.value) }} className='form-control faq-ansver-textarea' placeholder='Soru Giriniz'></textarea>
                    </div>
                    <div className='col-12 row'>
                        <textarea onChange={x => { setAnsver(x.target.value) }} className='form-control faq-question-textarea' placeholder='Cevap Giriniz'></textarea>
                    </div>
                    <div className='col-12 row mt-2 justify-content-end'>
                        <button onClick={() => { create() }} className='btn btn-success btn-sm'>Kaydet</button>
                    </div>
                </div>
                <Faq data={faqList}>
                    <div>dsa</div>
                </Faq>

            </div>
        </div>
    );
}

export default FaqCompnent;