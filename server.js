const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

function checkUltrasonicReadings(readings) {
    let ans = 0;
    for (let i = 0; i < readings.length; i++) {
        if (readings[i] < 60) {
            ans += 1;
        } else {
            ans -= 1;
        }
        if (ans > 2) {
            return true;
        }
    }
    return false;
}

app.get('/data', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    res.sendFile(filePath);
});

app.post('/slot_data', (req, res) => {
    console.log(req.body); // Now this should log the parsed body

    const { slot_data } = req.body;
    
    // Extract slot_id, slot_name, and readings from slot_data
    const slot_id = parseInt(slot_data.slice(0, 2), 16);
    const slot_name = slot_data.slice(2, 4);
    let readings = [];
    
    for (let i = 4; i < 20; i++) {
        const reading = parseInt(slot_data.slice(i, i + 2), 16);
        readings.push(reading);
    }

    const filePath = path.join(__dirname, 'data.json');

    
    // Check if ultrasonic readings are valid
    if (checkUltrasonicReadings(readings)) {
        // Add slot to data.json
        const data = JSON.parse(fs.readFileSync(filePath));

        if (data[slot_id]) { // Check if slot_id exists
            const availableSlots = data[slot_id].available_slots || [];
            // console.log(availableSlots);
            if (!availableSlots.includes(slot_name)) {
                console.log('Adding slot to data.json');
                availableSlots.push(slot_name);
                data[slot_id].available_slots = availableSlots;
                data[slot_id].slots = availableSlots.length;
                try {
  // Synchronously write the data to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Slot data added successfully');
    res.send('Slot made available');
  } catch (err) {
    console.log('Error writing to file:', err);
  }
  console.log('Slot data added successfully');
} catch (err) {
  console.log('Error writing to file:', err);
}
        }
    } else {

        // Remove slot from data.json
        const data = JSON.parse(fs.readFileSync(filePath));

        if (data[slot_id]) { // Check if slot_id exists
            const availableSlots = data[slot_id].available_slots || [];
            const index = availableSlots.indexOf(slot_name);
            
            if (index !== -1) {
                availableSlots.splice(index, 1); // Remove the slot_name from available_slots
                data[slot_id].available_slots = availableSlots;
                data[slot_id].slots = availableSlots.length;
try {
  // Synchronously write the data to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Slot data added successfully');
    res.send('Slot made available');
  } catch (err) {
    console.log('Error writing to file:', err);
  }
  console.log('Slot data added successfully');
} catch (err) {
  console.log('Error writing to file:', err);
}
        }
                }
            }
        }
    }

    res.send('Unknown error.');
});
                


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
