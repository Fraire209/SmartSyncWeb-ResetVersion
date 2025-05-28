        async function queryDynamoDB() {

            //Clear the output division
            document.getElementById('result').innerText = " ";


            // Get the partition and sort key values from input fields
            const roomValue = document.getElementById('partitionValue').value;
            const sortValue = document.getElementById('sortValue').value;
            const dateValue = document.getElementById('dateValue').value;

            const partitionValue = roomValue + "-" + dateValue;

            let apiUrl = `https://uac13zk9va.execute-api.us-east-1.amazonaws.com/v1/smartsync?PartitionKey=${partitionValue}`;

            if (sortValue) {
                apiUrl += `&SortKey=${sortValue}`;
            }

            try {
                // Fetch data from the API
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

               //Response from GET request
                const rawData = await response.json(); //parses json string
                const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData; //parses again due to double encoded JSON string


                //Error message output 
                if (data === "No Records Found") {
                    document.getElementById('result').innerHTML = `<p>${data}</p>`;
                    return;
                }

                //Sort the query in chronological order
                data.sort((a, b) => {
                    const parseTime = (timestamp) => {
                        const [time, modifier] = timestamp.split(' '); // Split time and AM/PM
                        let [hours, minutes, seconds] = time.split(':').map(Number); // Split into components

                            if (modifier === 'PM' && hours !== 12) {
                                hours += 12; // Convert PM to 24-hour format
                            } else if (modifier === 'AM' && hours === 12) {
                                hours = 0; // Handle midnight case
                            }

                            // Return total seconds since the start of the day
                            return hours * 3600 + minutes * 60 + seconds;
                    };
                    
                    //Sort the values
                    return parseTime(a.Timestamp) - parseTime(b.Timestamp);
                });

                // Safely delete the Room and Time property
                data.forEach(item => delete item.Room);
                data.forEach(item => delete item.Time);


                // Format the data for display
                const formattedData = data
                    .map(item => 
                        Object.entries(item)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('<br>') //line break in html
                    )
                    .join('<br><br>'); //line break in html

                // Update the result element
                document.getElementById('result').innerHTML = `<p>${formattedData}</p>`;
            
            } catch (error) {
                // Handle errors
                document.getElementById('result').innerText = `Error: ${error.message}`;
                console.error('Error querying DynamoDB:', error);
            }
        }

        //Query function for recorded incidents 
        async function QueryIncidents() {

            //Clear the output division
            document.getElementById('incidentresults').innerText = " ";

            //Extract the date value from input
            const selectedDate = document.getElementById('Fecha').value;

            //define api url 
            let incidentqueryAPI = `https://uac13zk9va.execute-api.us-east-1.amazonaws.com/v1/incidentQuery?DateValue=${selectedDate}`;


            try {
                // Fetch data from the API
                const response = await fetch(incidentqueryAPI, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                //Response from GET request 
                const rawData = await response.json(); //parses json string
                const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData; //parses again due to double encoded JSON string

                if (data === "No Record Found") {
                    document.getElementById('incidentresults').innerHTML = `<p>${data}</p>`;
                    return;
                }

                //Sort the query in chronological order
                data.sort((a, b) => {
                    const parseTime = (timestamp) => {
                        const [time, modifier] = timestamp.split(' '); // Split time and AM/PM
                        let [hours, minutes, seconds] = time.split(':').map(Number); // Split into components

                            if (modifier === 'PM' && hours !== 12) {
                                hours += 12; // Convert PM to 24-hour format
                            } else if (modifier === 'AM' && hours === 12) {
                                hours = 0; // Handle midnight case
                            }

                            // Return total seconds since the start of the day
                            return hours * 3600 + minutes * 60 + seconds;
                    };
                    
                    //Sort the values
                    return parseTime(a.Timestamp) - parseTime(b.Timestamp);
                });

                // Safely delete the Room and Time property
                data.forEach(item => delete item.Room);
                data.forEach(item => delete item.Time);


                // Format the data for display
                const formattedData = data
                    .map(item => 
                        Object.entries(item)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('<br>') //line break in html
                    )
                    .join('<br><br>'); //line break in html

                // Update the result element
                document.getElementById('incidentresults').innerHTML = `<p>${formattedData}</p>`;
            
            } catch (error) {
                // Handle errors
                document.getElementById('incidentresults').innerText = `Error: ${error.message}`;
                console.error('Error querying DynamoDB:', error);
            }
        }

        //Declared outside to be used by websocket incident function as well
        const resultElement = document.getElementById('incidentDashboard');
               
        async function incidentDashboard(){
             
            //Get date from system to only print todays incidents
            let systemDate = new Date();
            console.log(systemDate);
            let formattedDate = (systemDate.getMonth() + 1).toString().padStart(2, '0') + '/' + systemDate.getDate().toString().padStart(2, '0') + '/' + systemDate.getFullYear();
            
            //define api url 
            let incidentDashboardAPI = `https://uac13zk9va.execute-api.us-east-1.amazonaws.com/v1/incident?DateValue=${formattedDate}`;


            try {
                // Fetch data from the API
                const response = await fetch(incidentDashboardAPI, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                //Store response of GET request
                const data = await response.json();

                //Sort the query in chronological order
                data.sort((a, b) => {
                    const parseTime = (timestamp) => {
                        const [time, modifier] = timestamp.split(' '); // Split time and AM/PM
                        let [hours, minutes, seconds] = time.split(':').map(Number); // Split into components

                            if (modifier === 'PM' && hours !== 12) {
                                hours += 12; // Convert PM to 24-hour format
                            } else if (modifier === 'AM' && hours === 12) {
                                hours = 0; // Handle midnight case
                            }

                            // Return total seconds since the start of the day
                            return hours * 3600 + minutes * 60 + seconds;
                    };
                    
                    //Sort the values
                    return parseTime(a.Timestamp) - parseTime(b.Timestamp);
                });

                // Safely delete the Room and Time property
                data.forEach(item => delete item.Room);
                data.forEach(item => delete item.Time);

                console.log(data);
                //set flag for existing incidents 

                // Format the data for display
                const formattedData = data
                    .map(item => 
                        Object.entries(item)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('<br>') //line break in html
                    )
                    .join('<br><br>'); //line break in html
                


                if (!formattedData) {
                    resultElement.innerHTML = `<p>No incidents recorded today</p>`;
                } else {
                    // Remove the "No incidents..." message if it's there
                    if (resultElement.innerHTML.includes("No incidents recorded today")) {
                        resultElement.innerHTML = '';
                    }
                    // Append new incident
                    resultElement.innerHTML += `<p>${formattedData}</p>`;
                }
                    
                // Update the result element
                //document.getElementById('incidentDashboard').innerHTML = `<p>${formattedData}</p>`;

            } catch (error) {
                // Handle errors
                document.getElementById('incidentDashboard').innerText = `Error: ${error.message}`;
                console.error('Error querying DynamoDB:', error);
            }

        }
               

        // Step 1: Establish WebSocket connection
        let updatesocket;

        function initializeWebSocket() {


            //establish connection
            updatesocket = new WebSocket('wss://x290qiinj3.execute-api.us-east-1.amazonaws.com/production/');

            // Step 2: Handle WebSocket events
            updatesocket.onopen = function() {
                console.log("Recent Activity WebSocket connection established!");
               
            };

            let messageList = []; // Array to store all messages
            let updateTimeout; // Variable to track the timeout

            updatesocket.onmessage = function(event) {
                console.log("Message received: ", event.data);

                let formattedData = event.data
                        .replace(/[\[\]{}\"']/g, '')  // Remove unwanted characters
                        .replace(/,/g, ',\n');         // Add a newline after every comma
                    
                // Add the formatted message to the list
                messageList.push(formattedData);

                // Restart the timeout timer for printing the dashboard
                if (updateTimeout) {
                    clearTimeout(updateTimeout); // Clear the existing timer
                }

                updateTimeout = setTimeout(() => {
                    printDashboard();
                    messageList = []; // Clear the list after printing
                }, 150); // .150-second delay
                
            };

            function printDashboard() {
                // Update the "messages" div with the entire list
                document.getElementById("messages").innerHTML = messageList
                .map(message => `<p>${message}</p>`)
                .join(''); // Join the list of messages as HTML
            };

            updatesocket.onerror = function(error) {
                console.error("WebSocket error: ", error);
            };

            updatesocket.onclose = function() {
                console.warn("WebSocket closed. Attempting to reconnect in a second...");
                setTimeout(initializeWebSocket, 1000); // Reconnect after delay
                
            };

        }

        //Establish incident report websocket
        let incidentsocket;

        function incidentWebSocket() {

            //establish connection 
            incidentsocket = new WebSocket('wss://aazjpa4x4d.execute-api.us-east-1.amazonaws.com/production/')

            // Step 2: Handle WebSocket events
            incidentsocket.onopen = function() {
                console.log("Incident WebSocket connection established!");
                
            };

            incidentsocket.onmessage = function(event) {
                console.log("Message received: ", event.data);
            
                // Parse the message into a JSON object
                let message = JSON.parse(event.data);
            
                // Remove the "Room" and "Time" properties from the object
                delete message.Room;
                delete message.Time;
            
                
            
                let Reset = "False";
                // Extract the location from the message
                let location = message.Location;

                //Extract the timestamp
                let time = message.Timestamp;
                
                //executeIfWithinTimeLimit(difference, location);
               monitorSvgUpdate(location, Reset);
            
               
                // Format the data for display
                let formattedData = JSON.stringify(message)
                    .replace(/[\[\]{}\"']/g, '')  // Remove unwanted characters
                    .replace(/,/g, ',<br>')        // Add a newline after every comma
                    .replace(/,/g, '')             // Remove extra commas
                    .replace(/([^:\d]+):/g, '$1: '); // Only add space after colon for key-value pairs, not time

                // Remove the "No incidents..." message if it's there
                if (resultElement.innerHTML.includes("No incidents recorded today")) {
                    resultElement.innerHTML = '';
                }
                // Append new incident
                resultElement.innerHTML += `<p>${formattedData}</p>`;
                
            };
            
            
            incidentsocket.onerror = function(error) {
                console.error("WebSocket error: ", error);
            };

            incidentsocket.onclose = function() {
                console.warn("WebSocket closed. Attempting to reconnect in a second...");
                setTimeout(incidentWebSocket, 1000); // Reconnect after delay
            };
        }



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //initial scan of the resetrecords table upon site load
        async function ResetStatus() {

            let apiUrl = "https://uac13zk9va.execute-api.us-east-1.amazonaws.com/v1/ResetStatus";

            try {
                // Fetch data from the API
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                data = await response.json();
                console.log(data);

                
                // Iterate through each item in the array
                for (const item of data) {
                    // Extract timestamp and location
                    const Reset = item.Reset; // Either true or false
                    const location = item.Room;   // Room number 
                    
                    monitorSvgUpdate(location, Reset);
                    
                }

            }catch (error) {
                // Handle errors
                console.error('Error scanning ResetRecords Table:', error);
            }
        }

        
         // Step 1: Establish WebSocket connection
         let resetsocket;

         function ResetWebSocket() {


            //establish connection 
            resetsocket = new WebSocket('wss://ge3oft6oc0.execute-api.us-east-1.amazonaws.com/production/');

             // Step 2: Handle WebSocket events
             resetsocket.onopen = function() {
                 console.log("Reset WebSocket connection established!");
                
             };
 
             resetsocket.onmessage = function(event) {
                 console.log("Message received: ", event.data);

                 try {
                    const data = JSON.parse(event.data); // Parse JSON data
            
                    const Room = data.Room;  // Extract values
                    const Reset = data.Reset;
            
                    monitorSvgUpdate(Room, Reset); //change it back to white as it only receives true reset status

                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
                 
 
             };
 
             resetsocket.onerror = function(error) {
                 console.error("WebSocket error: ", error);
             };
 
             resetsocket.onclose = function() {
                console.warn("WebSocket closed. Attempting to reconnect in a second...");
                setTimeout(ResetWebSocket, 1000); // Reconnect after delay
                 
             };
 
         }


        
        //changes map color
        function monitorSvgUpdate(location, Reset) {
           
            const svgObject = document.getElementById("svg-object");
            if(Reset == "False"){
            
                fillColor = "#FF0000";
            }else {
                
                fillColor = "#FFFFFF"
            }
            updateSvgFill(location, fillColor)
        
            // Update the SVG fill color
            function updateSvgFill(location, fillColor) {
                if (svgObject) {
                    if (svgObject.contentDocument) {
                        applyFill(svgObject.contentDocument, location, fillColor);
                    } else {
                        // In case the SVG is not loaded yet, listen for the load event
                        svgObject.addEventListener("load", function () {
                            applyFill(svgObject.contentDocument, location, fillColor);
                        });
                    }
                } else {
                    console.log("SVG object not found");
                }
            }
        
            // Apply the fill color to the specified path
            function applyFill(svgDoc, location, fillColor) {
                const pathElement = svgDoc.getElementById(location);
                if (pathElement) {
                    pathElement.setAttribute("fill", fillColor);
                } else {
                    console.log("No matching SVG path found for location", location);
                }
            }
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async function handleSend() {
            
            // Get the partition and sort key values from input fields
            let name = document.getElementById('nameValue').value;
            let number = document.getElementById('numberValue').value;
            let email = document.getElementById('emailValue').value;
            let message = document.getElementById('messageValue').value;

            if (!name || !number || !email || !message) {
                document.getElementById('sendresult').innerHTML = `<errorp>All fields are required.</errorp>`;
                return;
            }
          
            try {
                const response = await fetch('https://ngvw4trl11.execute-api.us-east-1.amazonaws.com/v1/contact', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                        // Formats the body with all the attributes
                        body: JSON.stringify({name, number,  email,  message }),
                });
            
                if (response.ok) {
                  document.getElementById('sendresult').innerHTML = `<p>Message sent successfully.</p>`;
                } else {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
              } catch (error) {
                console.error(error);
                document.getElementById('sendresult').innerHTML = `<errorp>Failed to send message. Please try again.</errorp>`;
              }
            
          };
          
           //perform these function on window load
        window.onload = function() {
            initializeWebSocket(); //recent activity dashboard
            incidentDashboard(); //recent incident history GET request
            incidentWebSocket(); //receive messages of recorded incidents
            ResetStatus(); //reset status for measured rooms 
            ResetWebSocket(); //reset websocket for live updates 
        };
        
        
    