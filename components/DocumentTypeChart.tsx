import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);





const labels = [''];

export function DocumentTypeChart({ year }) {

   const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text:year +' Yılı Sertifika ve Rapor',
      },
    },
  };

  const [chartData, setChartData] = useState( {
    labels,
    datasets: [
      {
        label: '*',
        data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Dataset 2',
        data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

  useEffect(() => {

    start()

  }, [year]);

  const start = async () => {
    var d = await GetWithToken("Charts/getDocumentTypeByYear/" + year).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
    var data = d.data
  


    setChartData(data);

  }


  return <Line options={options} data={chartData} />;
  

}
