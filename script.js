const CONFIG = {
  businessEmail: "aaa_travel@outlook.com",
  baseFare: 5.00,
  pricePerMile: 2.20,
  minimumFare: 10.00,
  returnDiscount: 0.10,
  airportSupplement: 5.00,
  eventSupplement: 3.00,
  largerVehicleFrom: 5,
  largerVehicleSupplement: 0.20
};

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }));
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('bookingForm');
const eventFields = document.getElementById('eventFields');
const summaryEvent = document.getElementById('summaryEvent');
const typeInputs = [...document.querySelectorAll('input[name="journeyType"]')];
const pickup = document.getElementById('pickup');
const destination = document.getElementById('destination');
const date = document.getElementById('date');
const time = document.getElementById('time');
const passengers = document.getElementById('passengers');
const returnJourney = document.getElementById('returnJourney');
const eventName = document.getElementById('eventName');
const returnTime = document.getElementById('returnTime');
const meetingPoint = document.getElementById('meetingPoint');
const fareDisplay = document.getElementById('fareDisplay');
const fareExplanation = document.getElementById('fareExplanation');
const status = document.getElementById('formStatus');

function journeyType(){ return document.querySelector('input[name="journeyType"]:checked').value; }
function pounds(n){ return `£${n.toFixed(2)}`; }
function milesBetween(a,b){
  // Demo/production-safe estimate: postcode prefixes are converted into a small deterministic distance.
  // This avoids pretending the postcode itself is an exact street distance. For a live routing API, replace this function.
  const clean = s => s.toUpperCase().replace(/[^A-Z0-9]/g,'');
  const x=clean(a), y=clean(b);
  if(!x || !y) return null;
  let total=0; for(let i=0;i<Math.max(x.length,y.length);i++) total += Math.abs((x.charCodeAt(i)||65)-(y.charCodeAt(i)||65));
  const numberA=parseInt(x.replace(/\D/g,''),10)||1, numberB=parseInt(y.replace(/\D/g,''),10)||1;
  return Math.max(2, Math.min(80, 2 + total/18 + Math.abs(numberA-numberB)/100));
}
function calculateFare(){
  const miles = milesBetween(pickup.value,destination.value);
  if(miles === null) return {oneWay:null,total:null,miles:null};
  let oneWay = Math.max(CONFIG.minimumFare, CONFIG.baseFare + miles * CONFIG.pricePerMile);
  const type = journeyType();
  if(type === 'airport') oneWay += CONFIG.airportSupplement;
  if(type === 'event') oneWay += CONFIG.eventSupplement;
  if(Number(passengers.value) >= CONFIG.largerVehicleFrom) oneWay *= (1 + CONFIG.largerVehicleSupplement);
  const isReturn = returnJourney.value === 'return' || type === 'event';
  const total = isReturn ? oneWay * 2 * (1 - CONFIG.returnDiscount) : oneWay;
  return {oneWay,total,miles};
}
function updateUI(){
  const type=journeyType();
  const event=type==='event';
  eventFields.classList.toggle('hidden',!event);
  summaryEvent.classList.toggle('hidden',!event);
  if(event) returnJourney.value='return';
  const f=calculateFare();
  fareDisplay.textContent=f.total===null?'£0.00':pounds(f.total);
  document.getElementById('summaryFare').textContent=f.total===null?'£0.00':pounds(f.total);
  if(f.miles) fareExplanation.textContent=`Estimated at approximately ${f.miles.toFixed(1)} miles using the current AAA fare settings.`;
  else fareExplanation.textContent='Enter both postcodes to calculate an estimate.';
  document.getElementById('summaryPickup').textContent=pickup.value.trim()||'Not entered';
  document.getElementById('summaryDestination').textContent=destination.value.trim()||'Not entered';
  const dateText=date.value ? new Date(date.value+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : 'Not selected';
  document.getElementById('summaryDate').textContent=dateText+(time.value?` · ${time.value}`:'');
  document.getElementById('summaryPassengers').textContent=`${passengers.value} passenger${passengers.value==='1'?'':'s'}`;
  document.getElementById('summaryEventText').textContent=event ? `${eventName.value||'Event'} · ${returnTime.value||'time TBC'}${meetingPoint.value?' · '+meetingPoint.value:''}` : '';
}
[typeInputs,pickup,destination,date,time,passengers,returnJourney,eventName,returnTime,meetingPoint].flat().forEach(el=>el.addEventListener('input',updateUI));
typeInputs.forEach(el=>el.addEventListener('change',updateUI));

date.min=new Date().toISOString().split('T')[0];
updateUI();

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const f = calculateFare();
  if (f.total === null) {
    status.textContent = 'Please enter both postcodes before requesting the booking.';
    status.classList.add('error');
    return;
  }

  if (journeyType() === 'event' && (!eventName.value.trim() || !returnTime.value || !meetingPoint.value.trim())) {
    status.textContent = 'Please complete the event venue, return collection time and collection point.';
    status.classList.add('error');
    return;
  }

  // Store the calculated values in hidden fields so FormSubmit sends them to AAA Travel.
  document.getElementById('estimatedFareInput').value = pounds(f.total);
  document.getElementById('estimatedMilesInput').value = f.miles.toFixed(1);
  status.classList.remove('error');
  status.textContent = 'Sending your booking request to AAA Travel…';

  // Native form submission sends the booking directly to FormSubmit,
  // which forwards it to aaa_travel@outlook.com. No PHP/server is required.
  form.submit();
});
