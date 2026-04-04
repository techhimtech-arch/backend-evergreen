# Frontend Integration Spec: Target Assignments

Yeh document **Assignments API** ke frontend integration aur payloads ke baare mein detail deta hai. Is flow se Admin targets assign karenge (kitni zameen, kitne ped) aur Planters (Mobile App) par apne targets dekh payenge.

## Flow Samajhiye:
1. **Admin/Nodal Officer:** Ek Group banata hai. Fir us group ko ek Assignment deta hai ki aapko falana area mein `100` ped lagane hain jisme `Neem` aur `Peepal` shamil hain.
2. **Planter (Frontend App):** App open karta hai. Usko apne assigned targets dikhte hain (Target: 100). Jaise jaise wo ped laga kar Geo-tag (POST `/api/v1/trees`) karta hai, hum frontend dashboard par progress dikhate hain.

---

## 1. Create Target Assignment (Admin Portal)
**Endpoint:** `POST /api/v1/assignments`  
**Description:** Use this to assign target plants and land area to a specific group.

### Request Payload (JSON)
```json
{
  "groupId": "65f1a2b3c4d5e6f7a8b9c0d1",  // ID of the group receiving the target
  "assignedOfficer": "65f1a2b3c4d5e6f7a8b9c0d2", // Nodal Officer ya Admin ki ID (user ID)
  "landArea": 10.5, // Zameen ka area (Hectares ya Acres mein jo aapne base unit tay ki ho)
  "targetPlants": 500, // Kitne paudhe lagane hain
  "species": ["Neem", "Banyan", "Peepal"] // (Optional) Allowable species array
}
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "65f2c3d4e5f6...",
    "groupId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "assignedOfficer": "65f1a2b3c4d5e6f7a8b9c0d2",
    "landArea": 10.5,
    "targetPlants": 500,
    "species": ["Neem", "Banyan", "Peepal"],
    "assignedDate": "2024-03-14T10:30:00.000Z",
    "createdAt": "2024-03-14T10:30:00.000Z",
    "updatedAt": "2024-03-14T10:30:00.000Z"
  }
}
```

---

## 2. Get All Assignments (Admin Dashboard / List)
**Endpoint:** `GET /api/v1/assignments`  
**Description:** Saari assignments fetch karne ke liye (list with populated group details).

### Request Payload
*None required. Use Bearer Token in headers.*

### Expected Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f2c3d4e5f6...",
      "groupId": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Gram Panchayat Green Team",
        "location": "Shimla"
      },
      "landArea": 10.5,
      "targetPlants": 500,
      "species": ["Neem", "Banyan", "Peepal"],
      "assignedDate": "2024-03-14T10:30:00.000Z"
    }
  ]
}
```

---

## 3. Get Single Assignment Detail
**Endpoint:** `GET /api/v1/assignments/:id`  
**Description:** Kisi ek specific assignment ki poori detail fetch karne ke liye.

### Request Payload
*None required. Pass the Assignment ID in URL path.*

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65f2c3d4e5f6...",
    "groupId": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Gram Panchayat Green Team",
      "status": "ACTIVE"
    },
    "landArea": 10.5,
    "targetPlants": 500,
    "species": ["Neem", "Banyan", "Peepal"],
    "assignedDate": "2024-03-14T10:30:00.000Z"
  }
}
```

---

## Useful Tips for Frontend Developer 💡
1. **Dropdowns in Admin Form:** 
   - `groupId` ke liye aapko `GET /api/v1/groups` call call karke list of groups dikhani hogi.
   - `species` (plants) ke selection ke liye `GET /api/v1/plants` call karke pedon ki list autocomplete ya multi-select dropdown mein deni hogi.
2. **Dashboard Logic (Mobile App):**
   - Planter ke dashboard mein **Target** (e.g. `500` plants) `GET /api/v1/assignments` se aayega. 
   - Kitne lag gaye **(Planted)**? Usko measure karne ke liye aapko `GET /api/v1/trees?groupId=<user-group-id>` type ka data fetch karke length calculate karni padegi, ya phir baad mein hum ek Aggregation API (progress dashboard endpoint) bana denge jo seedha `{ target: 500, planted: 230 }` dega.
