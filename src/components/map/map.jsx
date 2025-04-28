// LiveLocationTracker.jsx
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { MapPin, Users, MapIcon, Building } from 'lucide-react';

// We need to do a conditional import for Leaflet since it's not server-side rendering compatible
const MapTracker = (props) => {
  const [mapComponent, setMapComponent] = useState(null);
  
  useEffect(() => {
    // Dynamically import Leaflet components only on client-side
    import('./MapTrackerComponent').then(module => {
      setMapComponent(() => module.default);
    });
  }, []);
  
  if (!mapComponent) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center text-gray-600">
          <MapIcon className="animate-pulse mb-2" size={32} />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }
  
  const MapComponent = mapComponent;
  return <MapComponent {...props} />;
};

// Example usage component
const LiveLocationTracker = () => {
  // Sample data - in a real application, this would come from your API
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      routeColor: '#3388ff',
      status: 'Active',
      customers: 3
    },
    {
      id: '2',
      name: 'Mike Davis',
      location: { lat: 37.7648, lng: -122.4450 }, // San Francisco (nearby)
      routeColor: '#33cc33',
      status: 'On Route',
      customers: 2
    }
  ]);

  const [customers, setCustomers] = useState([
    {
      id: '101',
      name: 'Acme Corporation',
      location: { lat: 37.7833, lng: -122.4167 }, // San Francisco downtown
      address: '123 Market St, San Francisco, CA',
      priority: 'High'
    },
    {
      id: '102',
      name: 'TechStart Inc',
      location: { lat: 37.7694, lng: -122.4862 }, // San Francisco west
      address: '456 Ocean Ave, San Francisco, CA',
      priority: 'Medium'
    },
    {
      id: '103',
      name: 'Golden Gate Retail',
      location: { lat: 37.7895, lng: -122.4058 }, // SF Financial District
      address: '789 Montgomery St, San Francisco, CA',
      priority: 'Low'
    }
  ]);

  // Simulate agent movement (for demo purposes)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          location: {
            lat: agent.location.lat + (Math.random() - 0.5) * 0.001,
            lng: agent.location.lng + (Math.random() - 0.5) * 0.001,
          }
        }))
      );
    }, 3000); // Update every 3 seconds for more visible animation

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="live-tracking-app bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              <MapPin className="mr-2" />
              Sales Agent Tracking System
            </h1>
            <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Tracking Active
            </div>
          </div>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left column (2/3 width) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {/* Map Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <MapIcon className="mr-2" size={18} />
                  Live Tracking Map
                </h2>
                <div className="flex space-x-2">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm transition duration-200">
                    Refresh
                  </button>
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm transition duration-200">
                    Center View
                  </button>
                </div>
              </div>
              <div className="relative">
                <MapTracker
                  agents={agents}
                  customers={customers}
                  updateInterval={3000}
                  defaultZoom={14}
                  animated={true}
                />
              </div>
            </div>
            
            {/* Customer List Card */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="mr-2" size={18} />
                Customer Locations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        customer.priority === 'High' ? 'bg-red-100 text-red-800' :
                        customer.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{customer.address}</p>
                    <div className="mt-3 flex space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200 flex-grow">Details</button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 flex-grow">Assign</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column (1/3 width) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {/* Agent Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="mr-2" size={18} />
                Active Sales Team
              </h2>
              {agents.map(agent => (
                <div key={agent.id} className="mb-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: agent.routeColor || '#3388ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      marginRight: '12px'
                    }}>
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{agent.name}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          agent.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        {agent.status}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm transition duration-200">Contact</button>
                    </div>
                  </div>
                  <div className="mt-3 pl-12">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500">Customers:</span>
                        <span className="font-medium ml-1">{agent.customers}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500">ID:</span>
                        <span className="font-medium ml-1">{agent.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats Card */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Today's Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-700">{agents.length}</div>
                  <div className="text-sm text-blue-700">Agents</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-700">{customers.length}</div>
                  <div className="text-sm text-green-700">Customers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-700">2</div>
                  <div className="text-sm text-purple-700">In Progress</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-700">5</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
              </div>
            </div>
            
            {/* Additional Card for Right Column */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200 flex items-center justify-center">
                  <span>Add New Agent</span>
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition duration-200 flex items-center justify-center">
                  <span>Add New Customer</span>
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition duration-200 flex items-center justify-center">
                  <span>Generate Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveLocationTracker;