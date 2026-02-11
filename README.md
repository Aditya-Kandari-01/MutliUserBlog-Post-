**# Multi User Private Blog System**



**A Node.js + MongoDB based private blogging platform**

**where users can create personal blogs and admins**

**can manage all posts.**



**## 🚀 Features**



**- User Authentication (JWT)**

**- Private Dashboards**

**- Create / Edit / Delete Posts**

**- Admin Panel**

**- Cloudinary Image Upload**

**- Secure Routes**



**## 🛠 Tech Stack**



**- Node.js**

**- Express**

**- MongoDB**

**- Mongoose**

**- EJS**

**- JWT**



**## ⚙️ Installation**



**1. Clone the repo**



**git clone https://github.com/USERNAME/REPO.git**



**2. Install dependencies**



**npm install**



**3. Create .env file**



**cp .env.example .env**



**4. Run project**



**npm start**



**Open: http://localhost:10000**



**## Further Setup** 



1. **DB Setup**



**Step 1: MongoDB Atlas Setup**



* **Go to: https://www.mongodb.com/atlas**
* **Click Sign Up (Free Account)**
* **After login → Click Create Cluster (Free Tier)**



**Step 2: Choose**



* **Provider: AWS**
* **Region: Nearest**
* **Tier: Free**



**Step 3: Click Create**



* **Create Database User**
* **Go to Database Access**
* **Click Add New Database User**



**--> Set:**



* **Username**
* **Password**
* **Role: Read and Write**
* **Save**



**Step 4: Network Access**



* **Allow Network Access**
* **Go to Network Access**
* **Click Add IP Address**
* **Choose Allow Access From Anywhere**
* **Save**





**Step 5: Get MongoDB URI**



* **Go to Clusters → Connect**
* **Choose Connect your application**
* **Copy the connection string**





**2. Cloudinary Setup (for image uploading and keeping the links in the mongodb)** 



* **Go to: https://cloudinary.com**
* **Click Sign Up (Free)**
* **Verify email and login**
* **Go to Dashboard**



**You will see:**



* **Cloud Name**
* **API Key**
* **API Secret**
* **Copy these values in .env file**























