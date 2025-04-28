import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const MapTrackerComponent = ({
  agents,
  customers,
  updateInterval = 10000, // Default to 10 seconds
  centerLocation,
  defaultZoom = 13,
  selectedAgent,
  selectedCustomer
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [agentMarkers, setAgentMarkers] = useState({});
  const [customerMarkers, setCustomerMarkers] = useState({});
  const [routeControls, setRouteControls] = useState({});
  const previousPositions = useRef({});
  
  // Fix Leaflet icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;
    
    // Calculate center if not provided
    const center = centerLocation || calculateCenterPoint();
    
    const newMap = L.map(mapRef.current, {
      zoomControl: false,  // We'll add it in a different position
      attributionControl: false
    }).setView([center.lat, center.lng], defaultZoom);
    
    // Add OpenStreetMap tiles with a cleaner style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(newMap);
    
    // Add zoom control to the top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(newMap);
    
    // Add attribution in bottom-right
    L.control.attribution({
      position: 'bottomright',
      prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(newMap);
    
    setMap(newMap);
    
    // Cleanup on unmount
    return () => {
      newMap.remove();
    };
  }, []);
  
  // Calculate center point from all locations
  const calculateCenterPoint = () => {
    const allLocations = [...agents.map(a => a.location), ...customers.map(c => c.location)];
    
    if (allLocations.length === 0) {
      return { lat: 0, lng: 0 }; // Default if no locations
    }
    
    const totalLat = allLocations.reduce((sum, loc) => sum + loc.lat, 0);
    const totalLng = allLocations.reduce((sum, loc) => sum + loc.lng, 0);
    
    return {
      lat: totalLat / allLocations.length,
      lng: totalLng / allLocations.length,
    };
  };
  
  // Animate marker movement
  const animateMarkerMovement = (marker, newPosition, oldPosition) => {
    if (!oldPosition) return marker.setLatLng(newPosition);
    
    let frames = 0;
    const totalFrames = 30; // Animation frames (should complete in ~0.5s)
    
    const latDiff = newPosition[0] - oldPosition[0];
    const lngDiff = newPosition[1] - oldPosition[1];
    
    const animate = () => {
      frames++;
      
      if (frames <= totalFrames) {
        const newLat = oldPosition[0] + (latDiff * frames / totalFrames);
        const newLng = oldPosition[1] + (lngDiff * frames / totalFrames);
        
        marker.setLatLng([newLat, newLng]);
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };
  
  // Update agent markers
  useEffect(() => {
    if (!map) return;
    
    // Update or create agent markers
    const newAgentMarkers = { ...agentMarkers };
    
    agents.forEach(agent => {
      const newPosition = [agent.location.lat, agent.location.lng];
      const oldPosition = previousPositions.current[`agent-${agent.id}`];

      // Create pulsing animation for the agent icon
      const createPulsingIcon = (color) => {
        return L.divIcon({
          className: 'custom-agent-icon',
          html: `<div class="marker-container">
            <div class="agent-marker" style="
              background-color: ${color}; 
              border: 2px solid white; 
              border-radius: 50%; 
              width: 16px; 
              height: 16px;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
              position: relative;
              z-index: 10;
            ">
              <div class="pulse" style="
                position: absolute;
                top: -8px;
                left: -8px;
                right: -8px;
                bottom: -8px;
                border-radius: 50%;
                background-color: ${color};
                opacity: 0.4;
                z-index: 5;
                animation: pulse 2s infinite;
              "></div>
            </div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 0.2; }
              100% { transform: scale(0.5); opacity: 0.5; }
            }
          </style>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      };

      const createSelectedIcon = (color) => {
        return L.divIcon({
          className: 'custom-agent-icon-selected',
          html: `<div class="marker-container-selected">
            <div class="agent-marker-selected" style="
              background-color: ${color}; 
              border: 3px solid white; 
              border-radius: 50%; 
              width: 20px; 
              height: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
              position: relative;
              z-index: 20;
            ">
              <div class="pulse-selected" style="
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border-radius: 50%;
                border: 2px solid ${color};
                background-color: rgba(255,255,255,0.2);
                z-index: 15;
                animation: pulse-selected 1.5s infinite;
              "></div>
            </div>
          </div>
          <style>
            @keyframes pulse-selected {
              0% { transform: scale(0.8); opacity: 0.8; }
              50% { transform: scale(1.5); opacity: 0.4; }
              100% { transform: scale(0.8); opacity: 0.8; }
            }
          </style>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      };
      
      if (newAgentMarkers[agent.id]) {
        // Update existing marker position with animation
        const marker = newAgentMarkers[agent.id];
        
        // Update the icon if selection state changed
        if (selectedAgent && selectedAgent.id === agent.id) {
          marker.setIcon(createSelectedIcon(agent.routeColor || '#3388ff'));
        } else {
          marker.setIcon(createPulsingIcon(agent.routeColor || '#3388ff'));
        }
        
        // Animate the marker to its new position
        animateMarkerMovement(marker, newPosition, oldPosition);
      } else {
        // Create new marker
        const isSelected = selectedAgent && selectedAgent.id === agent.id;
        const agentIcon = isSelected 
          ? createSelectedIcon(agent.routeColor || '#3388ff')
          : createPulsingIcon(agent.routeColor || '#3388ff');
        
        const marker = L.marker(newPosition, { 
          icon: agentIcon,
          title: agent.name,
          zIndexOffset: isSelected ? 1000 : 0
        }).addTo(map);
        
        // Add tooltip for quick info on hover
        marker.bindTooltip(agent.name, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -10]
        });
        
        // Add popup with more details on click
        marker.bindPopup(`
          <div class="agent-popup" style="width: 200px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: ${agent.routeColor || '#3388ff'};
                margin-right: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
              ">${agent.name.charAt(0)}</div>
              <strong>${agent.name}</strong>
            </div>
            <div style="font-size: 12px; margin-bottom: 5px;">
              Status: <span style="color: ${agent.status === 'Active' ? 'green' : 'orange'};">
                ${agent.status}
              </span>
            </div>
            <div style="font-size: 12px; margin-bottom: 10px;">
              Last update: ${agent.lastUpdate || 'N/A'}
            </div>
            <button onclick="window.agentContact('${agent.id}')" style="
              background-color: #3388ff;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
              font-size: 12px;
            ">Contact Agent</button>
          </div>
        `);
        
        newAgentMarkers[agent.id] = marker;
      }
      
      // Store position for next animation
      previousPositions.current[`agent-${agent.id}`] = newPosition;
    });
    
    // Remove markers for agents that no longer exist
    Object.keys(agentMarkers).forEach(agentId => {
      if (!agents.find(a => a.id === agentId)) {
        map.removeLayer(agentMarkers[agentId]);
        delete newAgentMarkers[agentId];
        delete previousPositions.current[`agent-${agentId}`];
      }
    });
    
    setAgentMarkers(newAgentMarkers);
  }, [map, agents, selectedAgent]);
  
  // Update customer markers
  useEffect(() => {
    if (!map) return;
    
    // Update or create customer markers
    const newCustomerMarkers = { ...customerMarkers };
    
    customers.forEach(customer => {
      const createCustomerIcon = (isSelected) => {
        const color = isSelected ? '#ff0000' : '#ff5555';
        const size = isSelected ? 16 : 12;
        const borderWidth = isSelected ? 3 : 2;
        
        return L.divIcon({
          className: 'custom-customer-icon',
          html: `<div style="
            background-color: ${color}; 
            border: ${borderWidth}px solid white; 
            border-radius: 50%; 
            width: ${size}px; 
            height: ${size}px;
            box-shadow: 0 0 ${isSelected ? '10px' : '5px'} rgba(0,0,0,${isSelected ? '0.5' : '0.3'});
            ${isSelected ? 'animation: customer-pulse 2s infinite;' : ''}
          "></div>
          ${isSelected ? `
          <style>
            @keyframes customer-pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.3); }
              100% { transform: scale(1); }
            }
          </style>` : ''}`,
          iconSize: [size, size],
          iconAnchor: [size/2, size/2],
        });
      };
      
      const isSelected = selectedCustomer && selectedCustomer.id === customer.id;
      
      if (newCustomerMarkers[customer.id]) {
        // Update existing marker
        const marker = newCustomerMarkers[customer.id];
        marker.setIcon(createCustomerIcon(isSelected));
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      } else {
        // Create new marker
        const marker = L.marker([customer.location.lat, customer.location.lng], { 
          icon: createCustomerIcon(isSelected),
          title: customer.name,
          zIndexOffset: isSelected ? 1000 : 0
        }).addTo(map);
        
        // Add tooltip for quick info on hover
        marker.bindTooltip(customer.name, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -8]
        });
        
        // Add popup with more details on click
        marker.bindPopup(`
          <div class="customer-popup" style="width: 220px;">
            <div style="margin-bottom: 8px;">
              <strong style="font-size: 14px;">${customer.name}</strong>
              <div style="font-size: 12px; color: #666; margin-top: 2px;">
                Customer ID: ${customer.id}
              </div>
            </div>
            
            <div style="font-size: 12px; margin-bottom: 5px;">
              <strong>Address:</strong><br>
              ${customer.address || 'No address available'}
            </div>
            
            <div style="font-size: 12px; margin-bottom: 10px;">
              <strong>Next Visit:</strong> ${customer.nextVisit || 'Not scheduled'}
            </div>
            
            <div style="display: flex; gap: 5px;">
              <button onclick="window.viewCustomerDetails('${customer.id}')" style="
                background-color: #3388ff;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                flex: 1;
                font-size: 12px;
              ">View Details</button>
              
              <button onclick="window.assignAgentToCustomer('${customer.id}')" style="
                background-color: #33cc33;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                flex: 1;
                font-size: 12px;
              ">Assign Agent</button>
            </div>
          </div>
        `);
        
        newCustomerMarkers[customer.id] = marker;
      }
    });
    
    // Remove markers for customers that no longer exist
    Object.keys(customerMarkers).forEach(customerId => {
      if (!customers.find(c => c.id === customerId)) {
        map.removeLayer(customerMarkers[customerId]);
        delete newCustomerMarkers[customerId];
      }
    });
    
    setCustomerMarkers(newCustomerMarkers);
  }, [map, customers, selectedCustomer]);
  
  // Helper function to find nearest customers to an agent
  const findNearestCustomers = (agent, customerList, count = 1) => {
    return customerList
      .map(customer => ({
        ...customer,
        distance: calculateDistance(
          agent.location.lat,
          agent.location.lng,
          customer.location.lat,
          customer.location.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };
  
  // Helper function to find nearest agents to a customer
  const findNearestAgents = (customer, agentList, count = 1) => {
    return agentList
      .map(agent => ({
        ...agent,
        distance: calculateDistance(
          agent.location.lat,
          agent.location.lng,
          customer.location.lat,
          customer.location.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };
  
  // Calculate distance between two points (haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  // Calculate and display routes - focus on better route display
  useEffect(() => {
    if (!map || !agents.length || !customers.length) return;
    
    // Clear previous routes
    Object.values(routeControls).forEach(control => {
      if (control.removeFrom) {
        control.removeFrom(map);
      } else if (control._container) {
        map.removeControl(control);
      } else if (control._polyline) {
        map.removeLayer(control._polyline);
      }
    });
    
    const newRouteControls = {};
    
    // Determine which routes to show based on selection
    let routesToShow = [];
    
    if (selectedAgent && selectedCustomer) {
      // If both agent and customer are selected, show route between them
      routesToShow.push({
        agentId: selectedAgent.id,
        customerId: selectedCustomer.id,
        agent: selectedAgent,
        customer: selectedCustomer
      });
    } else if (selectedAgent) {
      // If only agent is selected, show routes to nearest customers
      const nearestCustomers = findNearestCustomers(selectedAgent, customers, 2);
      nearestCustomers.forEach(customer => {
        routesToShow.push({
          agentId: selectedAgent.id,
          customerId: customer.id,
          agent: selectedAgent,
          customer
        });
      });
    } else if (selectedCustomer) {
      // If only customer is selected, show routes from nearest agents
      const nearestAgents = findNearestAgents(selectedCustomer, agents, 2);
      nearestAgents.forEach(agent => {
        routesToShow.push({
          agentId: agent.id,
          customerId: selectedCustomer.id,
          agent,
          customer: selectedCustomer
        });
      });
    } else {
      // Default: Show routes from each agent to nearest customer
      agents.forEach(agent => {
        const nearestCustomer = findNearestCustomers(agent, customers, 1)[0];
        if (nearestCustomer) {
          routesToShow.push({
            agentId: agent.id,
            customerId: nearestCustomer.id,
            agent,
            customer: nearestCustomer
          });
        }
      });
    }
    
    // Create routes
    routesToShow.forEach(route => {
      const { agentId, customerId, agent, customer } = route;
      const routeId = `${agentId}-${customerId}`;
      const waypoints = [
        L.latLng(agent.location.lat, agent.location.lng),
        L.latLng(customer.location.lat, customer.location.lng)
      ];
      
      const routeColor = agent.routeColor || '#3388ff';
      
      try {
        // First try using Leaflet Routing Machine if available
        const routeControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          showAlternatives: false,
          fitSelectedRoutes: false,
          show: false, // Don't show the instruction panel
          lineOptions: {
            styles: [{ color: routeColor, opacity: 0.7, weight: 4, dashArray: '10, 10' }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          createMarker: function() { return null; } // Don't create markers, we already have them
        });
        
        routeControl.addTo(map);
        newRouteControls[routeId] = routeControl;
      } catch (e) {
        console.error("Error creating route:", e);
        
        // Fallback to a simple polyline if routing fails
        const polyline = L.polyline(waypoints, {
          color: routeColor,
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10'
        }).addTo(map);
        
        // Add arrow decoration to indicate direction
        const arrowHead = L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: '70%',
              repeat: 0,
              symbol: L.Symbol.arrowHead({
                pixelSize: 15,
                polygon: false,
                pathOptions: {
                  color: routeColor,
                  weight: 3,
                  opacity: 0.7
                }
              })
            }
          ]
        }).addTo(map);
        
        // Store polyline as a mock routing control with a removeFrom method
        newRouteControls[routeId] = {
          _polyline: polyline,
          _arrowHead: arrowHead,
          removeFrom: function(map) {
            map.removeLayer(this._polyline);
            map.removeLayer(this._arrowHead);
          }
        };
      }
      
      // Add estimated travel time on the route
      const distance = calculateDistance(
        agent.location.lat,
        agent.location.lng,
        customer.location.lat,
        customer.location.lng
      );
      
      // Estimate travel time (assuming average speed of 30 km/h)
      const travelTimeHours = distance / 30;
      let travelTimeText;
      
      if (travelTimeHours < 1/60) {
        travelTimeText = 'Less than 1 min';
      } else if (travelTimeHours < 1) {
        travelTimeText = `${Math.round(travelTimeHours * 60)} mins`;
      } else {
        const hours = Math.floor(travelTimeHours);
        const mins = Math.round((travelTimeHours - hours) * 60);
        travelTimeText = `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
      }
      
      // Calculate midpoint for label
      const midLat = (agent.location.lat + customer.location.lat) / 2;
      const midLng = (agent.location.lng + customer.location.lng) / 2;
      
      // Add travel time label
      const travelTimeMarker = L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: 'travel-time-label',
          html: `<div style="
            background-color: white;
            border: 1px solid ${routeColor};
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            color: #333;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          ">${travelTimeText} (${distance.toFixed(1)} km)</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        })
      }).addTo(map);
      
      // Store the label with the route
      if (newRouteControls[routeId]._polyline) {
        // For fallback polyline
        newRouteControls[routeId]._travelTimeMarker = travelTimeMarker;
        const oldRemoveFrom = newRouteControls[routeId].removeFrom;
        newRouteControls[routeId].removeFrom = function(map) {
          oldRemoveFrom.call(this, map);
          map.removeLayer(this._travelTimeMarker);
        };
      } else {
        // For Leaflet Routing Machine
        const oldRemove = newRouteControls[routeId]._container.remove;
        newRouteControls[routeId]._container.remove = function() {
          oldRemove.call(this);
          map.removeLayer(travelTimeMarker);
        };
      }
    });
    
    setRouteControls(newRouteControls);
  }, [map, agents, customers, selectedAgent, selectedCustomer]);
  
  // Add global functions for popup buttons
  useEffect(() => {
    window.agentContact = (agentId) => {
      alert(`Contacting agent ${agentId}...`);
      // In a real app, you would implement actual contact functionality
    };
    
    window.viewCustomerDetails = (customerId) => {
      alert(`Viewing details for customer ${customerId}`);
      // In a real app, you would show customer details
    };
    
    window.assignAgentToCustomer = (customerId) => {
      alert(`Select an agent to assign to customer ${customerId}`);
      // In a real app, you would open an agent selection dialog
    };
    
    return () => {
      // Cleanup
      delete window.agentContact;
      delete window.viewCustomerDetails;
      delete window.assignAgentToCustomer;
    };
  }, []);
  
  // Update map when a selection changes to ensure it's visible
  useEffect(() => {
    if (!map) return;
    
    if (selectedAgent && selectedCustomer) {
      // If both selected, fit bounds to include both
      const bounds = L.latLngBounds(
        [selectedAgent.location.lat, selectedAgent.location.lng],
        [selectedCustomer.location.lat, selectedCustomer.location.lng]
      );
      
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 14 });
    } else if (selectedAgent) {
      // If only agent selected, center on agent with animation
      map.setView(
        [selectedAgent.location.lat, selectedAgent.location.lng],
        Math.max(map.getZoom(), 14),
        { animate: true, duration: 0.5 }
      );
    } else if (selectedCustomer) {
      // If only customer selected, center on customer with animation
      map.setView(
        [selectedCustomer.location.lat, selectedCustomer.location.lng],
        Math.max(map.getZoom(), 14),
        { animate: true, duration: 0.5 }
      );
    }
  }, [map, selectedAgent, selectedCustomer]);
  
  // Add automatic refresh for agent positions if needed
  useEffect(() => {
    if (!updateInterval || updateInterval <= 0) return;
    
    // This would typically be replaced with an API call in a real app
    const refreshTimer = setInterval(() => {
      // In a real app, this is where you would fetch updated agent positions
      console.log('Refreshing agent positions...');
    }, updateInterval);
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, [updateInterval]);
  
  return (
    <div className="map-tracker-container" style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '600px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      />
      
      {/* Map Legend */}
      <div className="map-legend" style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Legend</div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#3388ff', 
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            marginRight: '8px' 
          }}></div>
          <span>Sales Agents</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            backgroundColor: '#ff5555', 
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            marginRight: '8px' 
          }}></div>
          <span>Customers</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '20px', 
            height: '3px', 
            backgroundColor: '#3388ff',
            marginRight: '8px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-3px',
              width: '0',
              height: '0',
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid #3388ff',
            }}></div>
          </div>
          <span>Routes</span>
        </div>
      </div>
      
      {/* Counter displaying stats */}
      <div className="map-stats" style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px',
        minWidth: '160px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Status</div>
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Agents Active:</span>
          <strong>{agents.filter(a => a.status === 'Active').length} / {agents.length}</strong>
        </div>
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Customers:</span>
          <strong>{customers.length}</strong>
        </div>
        <div style={{ marginBottom: '0', display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Routes:</span>
          <strong>{Object.keys(routeControls).length}</strong>
        </div>
      </div>
      
      {/* Optional control panel for filtering and options */}
      <div className="map-controls" style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px',
        minWidth: '220px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Map Controls</span>
          <button style={{ 
            border: 'none', 
            background: '#f0f0f0', 
            borderRadius: '3px', 
            padding: '2px 5px',
            cursor: 'pointer',
            fontSize: '10px'
          }} onClick={() => map.setView(calculateCenterPoint(), defaultZoom)}>
            Reset View
          </button>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              style={{ marginRight: '6px' }} 
              defaultChecked={true} 
              onChange={(e) => {
                // Toggle agent markers visibility
                Object.values(agentMarkers).forEach(marker => {
                  if (e.target.checked) {
                    marker.addTo(map);
                  } else {
                    marker.removeFrom(map);
                  }
                });
              }}
            />
            Show Agents
          </label>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              style={{ marginRight: '6px' }} 
              defaultChecked={true} 
              onChange={(e) => {
                // Toggle customer markers visibility
                Object.values(customerMarkers).forEach(marker => {
                  if (e.target.checked) {
                    marker.addTo(map);
                  } else {
                    marker.removeFrom(map);
                  }
                });
              }}
            />
            Show Customers
          </label>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              style={{ marginRight: '6px' }} 
              defaultChecked={true} 
              onChange={(e) => {
                // Toggle routes visibility
                Object.values(routeControls).forEach(control => {
                  if (e.target.checked) {
                    if (control._polyline) {
                      control._polyline.addTo(map);
                      if (control._arrowHead) control._arrowHead.addTo(map);
                      if (control._travelTimeMarker) control._travelTimeMarker.addTo(map);
                    } else {
                      control.addTo(map);
                    }
                  } else {
                    if (control._polyline) {
                      control._polyline.removeFrom(map);
                      if (control._arrowHead) control._arrowHead.removeFrom(map);
                      if (control._travelTimeMarker) control._travelTimeMarker.removeFrom(map);
                    } else {
                      control.removeFrom(map);
                    }
                  }
                });
              }}
            />
            Show Routes
          </label>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Update Interval:</label>
          <select 
            style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            defaultValue={updateInterval}
            onChange={(e) => {
              // This would typically call a function passed from the parent component
              console.log(`Update interval changed to ${e.target.value}ms`);
            }}
          >
            <option value="5000">Fast (5s)</option>
            <option value="10000">Normal (10s)</option>
            <option value="30000">Slow (30s)</option>
            <option value="60000">Very Slow (60s)</option>
          </select>
        </div>
      </div>
      
      {/* Search/filter component */}
      <div className="map-search" style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px',
        minWidth: '220px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Search & Filter</div>
        
        <div style={{ marginBottom: '8px' }}>
          <input 
            type="text" 
            placeholder="Search agents or customers..." 
            style={{ 
              width: '100%', 
              padding: '6px 10px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontSize: '12px'
            }}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              // Filter and highlight markers based on search
              Object.entries(agentMarkers).forEach(([id, marker]) => {
                const agent = agents.find(a => a.id === id);
                if (agent && agent.name.toLowerCase().includes(query)) {
                  marker.setIcon(createPulsingIcon(agent.routeColor || '#ff8800', true));
                } else {
                  marker.setIcon(createPulsingIcon(agent.routeColor || '#3388ff', false));
                }
              });
              
              Object.entries(customerMarkers).forEach(([id, marker]) => {
                const customer = customers.find(c => c.id === id);
                if (customer && customer.name.toLowerCase().includes(query)) {
                  marker.setIcon(createCustomerIcon(true));
                } else {
                  marker.setIcon(createCustomerIcon(false));
                }
              });
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            style={{ 
              flex: 1, 
              padding: '6px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontSize: '12px'
            }}
            onChange={(e) => {
              // Filter by agent status
              const status = e.target.value;
              if (status === 'all') {
                Object.entries(agentMarkers).forEach(([id, marker]) => {
                  marker.addTo(map);
                });
              } else {
                Object.entries(agentMarkers).forEach(([id, marker]) => {
                  const agent = agents.find(a => a.id === id);
                  if (agent && agent.status === status) {
                    marker.addTo(map);
                  } else {
                    marker.removeFrom(map);
                  }
                });
              }
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Agents</option>
            <option value="Inactive">Inactive Agents</option>
            <option value="OnBreak">On Break</option>
          </select>
          
          <button style={{ 
            backgroundColor: '#3388ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px'
          }} onClick={() => {
            // Reset all filters and views
            map.setView(calculateCenterPoint(), defaultZoom);
            
            // Reset all markers to default styles
            Object.entries(agentMarkers).forEach(([id, marker]) => {
              const agent = agents.find(a => a.id === id);
              marker.setIcon(createPulsingIcon(agent.routeColor || '#3388ff', false));
              marker.addTo(map);
            });
            
            Object.entries(customerMarkers).forEach(([id, marker]) => {
              marker.setIcon(createCustomerIcon(false));
              marker.addTo(map);
            });
            
            // Show all routes
            Object.values(routeControls).forEach(control => {
              if (control._polyline) {
                control._polyline.addTo(map);
                if (control._arrowHead) control._arrowHead.addTo(map);
                if (control._travelTimeMarker) control._travelTimeMarker.addTo(map);
              } else {
                control.addTo(map);
              }
            });
          }}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to create a pulsing icon for agents (moved outside component for clarity)
const createPulsingIcon = (color, highlight = false) => {
  const size = highlight ? 20 : 16;
  const borderWidth = highlight ? 3 : 2;
  const pulseAnimation = highlight ? 'pulse 1s infinite' : 'pulse 2s infinite';
  
  return L.divIcon({
    className: 'custom-agent-icon',
    html: `<div class="marker-container">
      <div class="agent-marker" style="
        background-color: ${color}; 
        border: ${borderWidth}px solid white; 
        border-radius: 50%; 
        width: ${size}px; 
        height: ${size}px;
        box-shadow: 0 0 ${highlight ? '10px' : '5px'} rgba(0,0,0,${highlight ? '0.5' : '0.3'});
        position: relative;
        z-index: ${highlight ? '20' : '10'};
      ">
        <div class="pulse" style="
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border-radius: 50%;
          background-color: ${color};
          opacity: ${highlight ? '0.6' : '0.4'};
          z-index: 5;
          animation: ${pulseAnimation};
        "></div>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.5); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.2; }
        100% { transform: scale(0.5); opacity: 0.5; }
      }
    </style>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Helper function to create customer icon (moved outside component for clarity)
const createCustomerIcon = (highlight = false) => {
  const color = highlight ? '#ff0000' : '#ff5555';
  const size = highlight ? 16 : 12;
  const borderWidth = highlight ? 3 : 2;
  
  return L.divIcon({
    className: 'custom-customer-icon',
    html: `<div style="
      background-color: ${color}; 
      border: ${borderWidth}px solid white; 
      border-radius: 50%; 
      width: ${size}px; 
      height: ${size}px;
      box-shadow: 0 0 ${highlight ? '10px' : '5px'} rgba(0,0,0,${highlight ? '0.5' : '0.3'});
      ${highlight ? 'animation: customer-pulse 2s infinite;' : ''}
    "></div>
    ${highlight ? `
    <style>
      @keyframes customer-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
    </style>` : ''}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

export default MapTrackerComponent;