import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);






export function DocumentApplicationChart({year,mout}) {
  const [chartData, setChartData] = useState( 
    {
      labels: ['s'],
      datasets: [
        {
          label: '# of Votes',
          data: [0],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
          ],
          borderWidth: 1,
        },
        
      ],
    }
   );
  
  useEffect(() => {

    start()

  }, [year,mout]);
  const start = async () => {
    
    var d = await GetWithToken("Charts/GetDocumentApplicationStatusChart/" + year+"/"+mout).then(x => { return x.data }).catch((e) => { AlertFunction("", e?.response?.data); return false })
    var data = d.data
    console.log("backdata",data)
    console.log("statik",chartData)


    setChartData(data);

  }

  return <PolarArea  data={chartData} />;
}
