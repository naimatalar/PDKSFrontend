import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import locales  from '@fullcalendar/core/locales-all'
import trLocales from '@fullcalendar/core/locales/tr'
import { useState, useEffect } from 'react'


export default function Calendar() {

calendarEvents();
  return (
    <div className='calendar' >
    <FullCalendar
   
  />
    </div>
  )
}