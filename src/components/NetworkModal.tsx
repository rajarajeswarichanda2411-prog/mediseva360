import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  HeartHandshake, 
  Siren, 
  Video, 
  Activity, 
  Baby, 
  FileBadge, 
  Heart, 
  Radio, 
  Home, 
  Accessibility,
  Search,
  ExternalLink,
  Phone,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Download,
  Share2
} from 'lucide-react';
import { 
  ALL_INDIA_HOSPITALS, 
  ALL_INDIA_DOCTORS, 
  ALL_INDIA_BLOOD_STOCK, 
  ALL_INDIA_LAB_TESTS, 
  ALL_INDIA_GOVERNMENT_SCHEMES 
} from '../data/hospitalsData';
import { Hospital, Doctor } from '../types';

interface NetworkModalProps {
  networkId: string | null;
  onClose: () => void;
  onBookHospital: (hospital: Hospital) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  networkId,
  onClose,
  onBookHospital,
  onBookDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [organPledged, setOrganPledged] = useState(false);
  const [telemedicineActive, setTelemedicineActive] = useState(false);

  if (!networkId) return null;

  const renderNetworkContent = () => {
    switch (networkId) {
      // 1. Government Hospitals Network
      case 'net-01': {
        const govtHospitals = ALL_INDIA_HOSPITALS.filter(
          h => (h.type === 'Government' || h.type === 'Autonomous Institute') &&
          (selectedState === 'All' || h.state === selectedState) &&
          (h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-emerald-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Pradhan Mantri Swasthya Suraksha & State Government Hospital Grid</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Free Outpatient Consultations (OPD), subsidized critical care, and zero-billing inpatient treatment for Ayushman Bharat (PM-JAY) and BPL cardholders across India.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospital or city (e.g. AIIMS, NIMS, Delhi, Hyderabad)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="All">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Chandigarh">Chandigarh</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {govtHospitals.map((h) => (
                <div key={h.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-emerald-400 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                        {h.type}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 mt-1">{h.name}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {h.address}, {h.city}, {h.state} - {h.pincode}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">⭐ {h.rating}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Emergency ICU Beds</span>
                      <strong className="text-emerald-700 font-mono text-sm">{h.availableIcuBeds} Available</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">OPD Hours</span>
                      <span className="text-slate-800 font-medium text-[11px]">{h.opdTimings}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${h.emergencyPhone}`}
                      className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{h.phone}</span>
                    </a>
                    <button
                      onClick={() => onBookHospital(h)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Book OPD Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 2. Private Hospitals Network
      case 'net-02': {
        const privateHospitals = ALL_INDIA_HOSPITALS.filter(
          h => (h.type === 'Private' || h.type === 'Charitable') &&
          (selectedState === 'All' || h.state === selectedState) &&
          (h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-950">NABH & JCI Accredited Super-Speciality Hospital Network</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Corporate hospital networks offering robotic oncology, organ transplants, high-dependency cardiac units, and dedicated cashless TPA desks.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {privateHospitals.map((h) => (
                <div key={h.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                          {h.type}
                        </span>
                        {h.accreditations.map((acc) => (
                          <span key={acc} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {acc}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mt-1.5">{h.name}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {h.city}, {h.state}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">⭐ {h.rating}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{h.description}</p>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-teal-800">
                      {h.doctorsCount} Specialists Active
                    </span>
                    <button
                      onClick={() => onBookHospital(h)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Book In-Person / Online
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 3. Doctors & Specialists Network
      case 'net-03': {
        const filteredDocs = ALL_INDIA_DOCTORS.filter(
          d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
               d.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <span className="text-xs font-bold text-teal-950">
                  National Medical Commission (NMC) Verified Consultants
                </span>
              </div>
              <span className="text-xs text-teal-700 font-semibold">{filteredDocs.length} Verified Doctors</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search specialist by name or specialty (e.g. Cardiology, Neurology, Pulmonology)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-teal-400 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                      <span className="text-xs font-semibold text-teal-700 block">{doc.specialty}</span>
                      <span className="text-[11px] text-slate-500">{doc.qualification} · {doc.experienceYears} Years Exp</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">⭐ {doc.rating}</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    <span className="block font-medium">📍 {doc.hospitalName}</span>
                    <span className="text-[11px] text-slate-500">Languages: {doc.languages.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Consultation Fee</span>
                      <strong className="text-sm font-bold text-slate-900 font-mono">₹{doc.consultationFee}</strong>
                    </div>
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 4. Pharmacies & Medical Stores Network
      case 'net-04': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Pill className="w-5 h-5 text-rose-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-950">Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</h4>
                  <p className="text-xs text-rose-800 mt-1">
                    Access quality generic medicines priced up to 50% to 90% less than branded market rates across 9,200+ Jan Aushadhi Kendras.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {[
                { name: 'Pradhan Mantri Jan Aushadhi Kendra #1042', city: 'Hyderabad', area: 'Punjagutta, near Metro', phone: '+91 94400 11223', discount: '80-90% OFF', stock: '2,400+ Generic Drugs' },
                { name: 'Pradhan Mantri Jan Aushadhi Kendra #821', city: 'New Delhi', area: 'Ansari Nagar, AIIMS Gate 2', phone: '+91 98110 55443', discount: '85% OFF', stock: '2,900+ Generic Drugs' },
                { name: 'Apollo Pharmacy 24/7 Superstore', city: 'Bengaluru', area: 'Indiranagar 100ft Road', phone: '+91 80 2520 8900', discount: '15-20% OFF', stock: '24/7 Emergency & Cold-Chain' },
                { name: 'MedPlus 24x7 Diagnostic & Pharmacy', city: 'Chennai', area: 'Anna Nagar West', phone: '+91 44 2621 4400', discount: '20% OFF', stock: 'Home Delivery Available' }
              ].map((pharm, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-slate-900">{pharm.name}</h5>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">{pharm.discount}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">📍 {pharm.area}, {pharm.city}</p>
                  <p className="text-xs text-slate-700 mt-1">📦 {pharm.stock}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">📞 {pharm.phone}</span>
                    <button 
                      onClick={() => alert(`Connecting with ${pharm.name}. Phone: ${pharm.phone}`)}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                    >
                      Call Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 5. Diagnostic Centres & Lab Network
      case 'net-05': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-950">NABL Accredited Diagnostics & Home Sample Collection</h4>
                <p className="text-xs text-amber-800 mt-0.5">Free phlebotomist home visit on all preventive health packages.</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded">NABL Certified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {ALL_INDIA_LAB_TESTS.map((test) => (
                <div key={test.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">
                    {test.category}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 mt-1.5">{test.testName}</h5>
                  <p className="text-xs text-slate-500 mt-1">{test.description}</p>

                  <div className="flex items-center gap-3 my-2 text-[11px] text-slate-600">
                    <span>⏱️ Report in {test.reportWithinHours} hrs</span>
                    <span>🧪 {test.sampleType}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900 font-mono">₹{test.price}</span>
                    <button
                      onClick={() => alert(`Lab Test Package "${test.testName}" booked for home collection! Our phlebotomist will contact you.`)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold transition-colors"
                    >
                      Book Home Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 6. Blood Bank Network
      case 'net-06': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-red-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-950">Live e-Rakt Kosh Blood Stock Tracker</h4>
                  <p className="text-xs text-red-800 mt-1">
                    Real-time available units of whole blood, packed red cells, platelets, and fresh frozen plasma across licensed blood banks in India.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {ALL_INDIA_BLOOD_STOCK.map((item) => (
                <div key={item.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.bloodBankName}</h5>
                      <p className="text-xs text-slate-500">📍 {item.city}, {item.state}</p>
                    </div>
                    <span className="text-base font-extrabold text-red-600 bg-red-100 px-2.5 py-1 rounded-lg font-mono">
                      {item.bloodGroup}
                    </span>
                  </div>

                  <div className="my-2 p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Available Units:</span>
                    <strong className="text-slate-900 font-mono text-sm">{item.unitsAvailable} Units</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">Updated: {item.lastUpdated}</span>
                    <a
                      href={`tel:${item.contactNumber}`}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold"
                    >
                      Call Blood Bank
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 7. Emergency Services Network
      case 'net-07': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-rose-600 text-white rounded-xl">
              <div className="flex items-center gap-3">
                <Siren className="w-8 h-8 shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-base font-extrabold">National Emergency Number: 112</h4>
                  <p className="text-xs text-rose-100 mt-0.5">
                    Single unified emergency number for Police, Fire, Ambulance, and Disaster response across all states and Union Territories in India.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-medium block">Ambulance Emergency</span>
                <strong className="text-xl font-bold text-rose-700 font-mono">108</strong>
                <p className="text-[11px] text-slate-500 mt-1">24/7 Free Emergency Ambulance</p>
                <a href="tel:108" className="mt-2 inline-block px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold">
                  Dial 108
                </a>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-medium block">Health Advice Helpline</span>
                <strong className="text-xl font-bold text-teal-700 font-mono">104</strong>
                <p className="text-[11px] text-slate-500 mt-1">Free Medical & Doctor Advice</p>
                <a href="tel:104" className="mt-2 inline-block px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded text-xs font-bold">
                  Dial 104
                </a>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-medium block">Ayushman Bharat Portal</span>
                <strong className="text-xl font-bold text-indigo-700 font-mono">14555</strong>
                <p className="text-[11px] text-slate-500 mt-1">PM-JAY Golden Card Help</p>
                <a href="tel:14555" className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold">
                  Dial 14555
                </a>
              </div>
            </div>
          </div>
        );
      }

      // 8. Telemedicine Network
      case 'net-08': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-indigo-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Official eSanjeevani Compliant Teleconsultation Suite</h4>
                  <p className="text-xs text-indigo-800 mt-1">
                    Connect face-to-face with registered specialists via encrypted WebRTC video. Valid digital prescriptions issued directly to your Digital Health Locker.
                  </p>
                </div>
              </div>
            </div>

            {telemedicineActive ? (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold">Live Consultation Simulator · Dr. Randeep Guleria</span>
                  </div>
                  <button 
                    onClick={() => setTelemedicineActive(false)}
                    className="px-2 py-0.5 bg-rose-600 text-white text-xs rounded font-bold"
                  >
                    End Call
                  </button>
                </div>
                <div className="h-44 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 text-slate-400 text-xs text-center p-4">
                  <div>
                    <Video className="w-8 h-8 mx-auto mb-2 text-teal-400 animate-pulse" />
                    <p className="font-semibold text-slate-200">Encrypted Consultation Video Link Active</p>
                    <p className="text-[11px] text-slate-400 mt-1">Doctor audio & HD feed connected. Patient camera ready.</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Consultation audio and diagnostic notes will be compiled into a digital prescription upon session completion.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-3">
                <Video className="w-10 h-10 text-indigo-600 mx-auto" />
                <h5 className="text-sm font-bold text-slate-900">Start an Instant Virtual Doctor Consultation</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Experience a high-definition encrypted medical consultation with certified clinicians across general medicine, pediatrics, and dermatology.
                </p>
                <button
                  onClick={() => setTelemedicineActive(true)}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Launch Telemedicine Room Simulator
                </button>
              </div>
            )}
          </div>
        );
      }

      // 11. Health Insurance & Government Schemes
      case 'net-11': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FileBadge className="w-5 h-5 text-violet-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-violet-950">National & State Healthcare Benefits Directory</h4>
                  <p className="text-xs text-violet-800 mt-1">
                    Check your eligibility for Central and State government health schemes. No patient should be denied life-saving care due to lack of funds.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {ALL_INDIA_GOVERNMENT_SCHEMES.map((scheme) => (
                <div key={scheme.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded uppercase">
                        {scheme.level} Scheme {scheme.state ? `· ${scheme.state}` : ''}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 mt-1">{scheme.schemeName}</h5>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md font-mono shrink-0">
                      {scheme.coverageAmount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2"><strong>Eligibility:</strong> {scheme.eligibility}</p>
                  <p className="text-xs text-slate-600 mt-1"><strong>Benefits:</strong> {scheme.benefits}</p>
                  <p className="text-xs text-slate-500 mt-1"><strong>Required Documents:</strong> {scheme.requiredDocuments.join(', ')}</p>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-medium">Helpline: {scheme.helpline}</span>
                    <a
                      href={scheme.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-violet-700 hover:text-violet-900 font-semibold"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 12. Organ Donation & Transplant Network (NOTTO)
      case 'net-12': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-950">National Organ & Tissue Transplant Organisation (NOTTO)</h4>
                  <p className="text-xs text-red-800 mt-1">
                    Pledge your organs and save up to 8 lives. Official registry managed under Ministry of Health and Family Welfare, Government of India.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h5 className="text-sm font-bold text-slate-900">National Organ Donor Pledge Card</h5>
              <p className="text-xs text-slate-600">
                I hereby pledge to donate all my organs (Kidneys, Liver, Heart, Lungs, Pancreas, Corneas, Skin) after my death for therapeutic transplantation.
              </p>

              {organPledged ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-950">Organ Pledge Registered Successfully!</p>
                  <p className="text-[11px] text-emerald-800">Registration ID: NOTTO-IND-2026-9812. Thank you for your noble pledge to humanity.</p>
                </div>
              ) : (
                <button
                  onClick={() => setOrganPledged(true)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Pledge My Organs Online Now
                </button>
              )}
            </div>
          </div>
        );
      }

      // 9. ICU & Critical Care Network
      case 'net-09': {
        const icuCentres = [
          { name: 'Apex Neuro & Cardiac Level-3 ICU Command Center', hospital: 'Apollo Hospitals Jubilee Hills', city: 'Hyderabad', icuType: 'Level 3 ECMO & Neuro ICU', availableBeds: 14, totalBeds: 45, ventilatorReady: 12, phone: '+91-40-23607777' },
          { name: 'Critical Care Trauma & Resuscitation Complex', hospital: 'AIIMS New Delhi Trauma Center', city: 'New Delhi', icuType: 'Level 1 Trauma ICU', availableBeds: 8, totalBeds: 50, ventilatorReady: 8, phone: '+91-11-26588500' },
          { name: 'Pediatric & Neonatal Intensive Care Unit (NICU/PICU)', hospital: 'Rainbow Children’s Hospital', city: 'Bengaluru', icuType: 'Advanced Pediatric ICU', availableBeds: 10, totalBeds: 35, ventilatorReady: 10, phone: '+91-80-42412345' },
          { name: 'Surgical Oncology & Septic Intensive Care', hospital: 'Tata Memorial Hospital', city: 'Mumbai', icuType: 'Oncology Critical Care', availableBeds: 6, totalBeds: 30, ventilatorReady: 6, phone: '+91-22-24177000' }
        ];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-cyan-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-cyan-950">National Critical Care & Ventilator ICU Grid</h4>
                  <p className="text-xs text-cyan-800 mt-1">
                    Live 24/7 tracking of Level-3 Adult, Pediatric, and Neonatal ICU beds with real-time mechanical ventilator readiness.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {icuCentres.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-cyan-400 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded uppercase">
                        {item.icuType}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 mt-1.5">{item.name}</h5>
                      <p className="text-[11px] text-slate-500">📍 {item.hospital}, {item.city}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg grid grid-cols-2 gap-2 text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Vacant ICU Beds</span>
                      <strong className="text-emerald-700 font-mono text-sm block">{item.availableBeds} / {item.totalBeds}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Ventilators Active</span>
                      <strong className="text-cyan-700 font-mono text-sm block">{item.ventilatorReady} Ready</strong>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Emergency Desk: {item.phone}</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-bold"
                    >
                      Reserve ICU
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 10. Mother & Child Care Network
      case 'net-10': {
        const maternityCentres = [
          { name: 'Fernandez Hospital Stork Home', city: 'Hyderabad', focus: 'High-Risk Obstetrics & Natural Birthing', nicuBeds: 28, rating: 4.9, phone: '+91-40-40222399' },
          { name: 'Rainbow Children’s Hospital & BirthRight', city: 'Hyderabad & Bangalore', focus: 'Tertiary Perinatology & Level-4 NICU', nicuBeds: 45, rating: 4.8, phone: '+91-40-42412345' },
          { name: 'Cloudnine Hospital for Maternity & Neonatology', city: 'Chennai & Bengaluru', focus: 'Maternal Fetal Medicine & Fetal Therapy', nicuBeds: 22, rating: 4.8, phone: '+91-80-67922222' },
          { name: 'Government Niloufer Hospital for Women & Children', city: 'Hyderabad', focus: 'Free State Pediatric & Maternal Care', nicuBeds: 80, rating: 4.5, phone: '+91-40-23394241' }
        ];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Baby className="w-5 h-5 text-pink-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-pink-950">Mother & Child Care (MCH) Specialized Network</h4>
                  <p className="text-xs text-pink-800 mt-1">
                    Dedicated tertiary birthing centers, fetal medicine units, Level-3/4 Neonatal ICUs (NICU), and comprehensive pediatric emergency suites.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {maternityCentres.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                      <p className="text-[11px] text-pink-700 font-medium">📍 {item.city}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">★ {item.rating}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 font-medium">{item.focus}</p>

                  <div className="mt-2 p-2 bg-pink-50/60 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-pink-900 font-semibold">Dedicated NICU Incubators:</span>
                    <strong className="text-pink-950 font-mono font-bold">{item.nicuBeds} Units Available</strong>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">24/7 Delivery Line: {item.phone}</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3 py-1 bg-pink-700 hover:bg-pink-800 text-white rounded-md text-xs font-bold"
                    >
                      Contact Unit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 13. Cancer Care & Oncology Network
      case 'net-13': {
        const cancerCentres = [
          { name: 'Tata Memorial Hospital & Advanced Cancer Centre', city: 'Mumbai', tech: 'Proton Beam Therapy, Bone Marrow Transplant, Robotic Surgery', subsidy: 'Subsidized & Free General Category', phone: '+91-22-24177000' },
          { name: 'Basavatarakam Indo-American Cancer Hospital & Research Institute', city: 'Hyderabad', tech: 'Linear Accelerator (LINAC), PET-CT, Medical Oncology', subsidy: 'Telangana Aarogyasri Empanelled', phone: '+91-40-23551235' },
          { name: 'Rajiv Gandhi Cancer Institute & Research Centre', city: 'Delhi', tech: 'CyberKnife Robotic Radiosurgery, TrueBeam LINAC', subsidy: 'Ayushman Bharat PM-JAY & CGHS', phone: '+91-11-47022222' },
          { name: 'Kidwai Memorial Institute of Oncology', city: 'Bengaluru', tech: 'Regional Comprehensive Cancer Centre, Radiotherapy Suites', subsidy: 'Autonomous Govt Institute - Free for BPL', phone: '+91-80-26094000' }
        ];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-purple-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-950">National Comprehensive Cancer Care (Oncology) Grid</h4>
                  <p className="text-xs text-purple-800 mt-1">
                    Apex cancer research and therapy centers equipped with Proton Beam, LINAC Radiotherapy, Bone Marrow Transplant, and subsidized chemo daycare.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {cancerCentres.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-purple-300 transition-colors">
                  <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                  <p className="text-[11px] text-purple-700 font-semibold mt-0.5">📍 {item.city}</p>

                  <p className="text-xs text-slate-600 mt-1.5"><strong>Therapies:</strong> {item.tech}</p>

                  <div className="mt-2 p-2 bg-purple-50/70 rounded-lg text-xs font-semibold text-purple-900">
                    🛡️ {item.subsidy}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{item.phone}</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-bold"
                    >
                      Book Oncology OPD
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 14. Radiology & Advanced Imaging Network
      case 'net-14': {
        const imagingCentres = [
          { name: 'Vijaya Diagnostic Center 3T MRI & Dual Source CT', city: 'Hyderabad & Vizag', modalities: '3.0 Tesla Silent MRI, 128-Slice Dual Source Cardiac CT, Digital Mammography', reportTime: '6-12 Hours', phone: '+91-40-23420412' },
          { name: 'Dr Lal PathLabs Advanced Radiodiagnostics', city: 'Delhi-NCR', modalities: 'Whole Body PET-CT, DEXA Bone Mineral Density, 4D Ultrasound with Color Doppler', reportTime: 'Same Day', phone: '+91-11-39885050' },
          { name: 'Mahajan Imaging & Nuclear Medicine Suite', city: 'New Delhi', modalities: 'Dual Energy Spectral CT, Functional MRI, Gallium-68 DOTA PET Scan', reportTime: 'Same Day', phone: '+91-11-43138000' },
          { name: 'Medall Healthcare Diagnostic Hub', city: 'Chennai & Bengaluru', modalities: 'High Resolution CT Angiography, Fluoroscopy, Digital X-Ray', reportTime: '4-8 Hours', phone: '+91-44-42998800' }
        ];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Radio className="w-5 h-5 text-sky-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-sky-950">NABL & AERB Certified Radiology & Nuclear Imaging</h4>
                  <p className="text-xs text-sky-800 mt-1">
                    Fast-track diagnostic imaging with 3T MRI, 128-Slice CT, and PET scans reviewed by subspecialist radiologists. Digital reports synced to ABHA.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {imagingCentres.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                  <p className="text-[11px] text-sky-700 font-semibold mt-0.5">📍 {item.city}</p>

                  <p className="text-xs text-slate-600 mt-1.5">{item.modalities}</p>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-700 bg-sky-50 p-2 rounded-lg">
                    <span>⚡ Report Turnaround: <strong>{item.reportTime}</strong></span>
                    <span className="text-emerald-700 font-bold">ABHA Synced</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{item.phone}</span>
                    <button
                      onClick={() => alert(`Radiology appointment requested at ${item.name}. Confirmation SMS sent.`)}
                      className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-xs font-bold"
                    >
                      Book Scan Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 15. Home Healthcare & Elderly Care Network
      case 'net-15': {
        const homecareServices = [
          { name: 'Apollo HomeCare Geriatric & Post-Op Service', city: 'Pan-India (24 Cities)', services: 'ICU at Home, 24/7 Bedside Nursing, Physiotherapy, Home Oxygen Therapy', rating: 4.8, phone: '+91 1860-500-8585' },
          { name: 'Portea Medical Comprehensive In-Home Care', city: 'Pan-India (16 States)', services: 'Doctor Home Visits, Wound Dressing, Chemotherapy at Home, Stroke Rehab', rating: 4.7, phone: '+91 1800-121-2323' },
          { name: 'Care24 Verified Nursing & Attendant Service', city: 'Mumbai & Delhi', services: 'Trained Patient Attendants, Dementia & Alzheimer Care, Vital Monitoring', rating: 4.6, phone: '+91 22-68224400' },
          { name: 'Medwell In-Home Palliative & Chronic Care', city: 'Bengaluru & Hyderabad', services: 'Post-Cardiac Care, Tracheostomy Nursing, Catheter Care, Portable X-Ray', rating: 4.8, phone: '+91 80-46644664' }
        ];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-emerald-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Home Healthcare, Nursing & Geriatric Network</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Certified ICU-trained nurses, doctor house calls, portable dialysis, and palliative care delivered safely in the comfort of your home.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {homecareServices.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                      <p className="text-[11px] text-emerald-700 font-semibold">📍 {item.city}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">★ {item.rating}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5">{item.services}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Helpline: {item.phone}</span>
                    <button
                      onClick={() => alert(`Home nurse / service dispatch requested for ${item.name}. Our coordinator is calling you back.`)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold"
                    >
                      Request Home Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Default handler
      default: {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900">Dedicated Healthcare Network Portal</h4>
              <p className="text-xs text-slate-600 mt-1">
                Verified healthcare providers, certified staff, and transparent care workflows aligned with national clinical establishment acts.
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Healthcare Network Operations
              </h3>
              <span className="text-xs text-slate-500">Live verified directory & direct actions</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {renderNetworkContent()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Pan-India Clinical Registry · Updated Hourly</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
