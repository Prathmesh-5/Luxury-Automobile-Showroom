Collection Name :

Cars

----------

Purpose:

This collection stores all vehicle information.

----------


Used In :

Inventory

Vehicle Details

Home

Search

Brand Pages

Featured Cars

Admin

-------------

Fields :

name

brandId

model

year

price

mileage

fuel

transmission

engine

description

images

features

status

type

featured

-----------------


Purpose

↓

Fields

↓

Datatype

↓

Validation

↓

Relationships

↓

Indexes

↓

Example Document

↓

Mongoose Schema

↓

CRUD APIs


------------------------


# Cars Collection

## 1. Purpose

## 2. Modules Using This Collection

## 3. Fields

## 4. Data Types

## 5. Validation Rules

## 6. Relationships

## 7. Indexes

## 8. Sample JSON Document

## 9. Mongoose Schema

## 10. CRUD APIs

--------------------------------

Step 1 : Purpose
The Cars collection stores complete information about every vehicle available in the showroom.

This collection is the core of the project because almost every page reads data from it.

---------------------------------

Step 2 : Modules Using Cars Collection

Home Page

Inventory Page

Vehicle Details Page

Brand Page

Search

Filters

Featured Cars

Admin Dashboard

Related Cars

----------------------------

Step 3 : Fields

Basic Information

_id

name

brandId

model

year

slug

condition

----

Pricing

price

currency

priceOnCall

----

Vehicle Details

engine

fuelType

transmission

mileage

color

interiorColor

horsepower

engineCapacity

drivetrain

doors

seats

----

Media

images

featuredImage

video


----

Description

description

features

----

Inventory

status

type

featured

----

SEO

metaTitle

metaDescription

keywords

----

Audit

createdBy

updatedBy

createdAt

updatedAt

---------------------------------------


Step 5: Data Types

Basic Information :

| Field     | Data Type | Required | Default | Description                    |
| --------- | --------- | -------- | ------- | ------------------------------ |
| _id       | ObjectId  | Yes      | Auto    | Primary Key                    |
| name      | String    | Yes      | -       | Car Name                       |
| brandId   | ObjectId  | Yes      | -       | Reference to Brands Collection |
| model     | String    | Yes      | -       | Car Model                      |
| slug      | String    | Yes      | -       | SEO Friendly URL               |
| year      | Number    | Yes      | -       | Manufacturing Year             |
| condition | String    | Yes      | Used    | New / Used                     |

Pricing :

| Field       | Type    | Required |
| ----------- | ------- | -------- |
| price       | Number  | Yes      |
| currency    | String  | Yes      |
| priceOnCall | Boolean | Yes      |


Vehicle Specifications :

| Field          | Type   |
| -------------- | ------ |
| mileage        | Number |
| engine         | String |
| engineCapacity | String |
| horsepower     | Number |
| transmission   | String |
| fuelType       | String |
| drivetrain     | String |
| exteriorColor  | String |
| interiorColor  | String |
| seats          | Number |
| doors          | Number |


Images :

| Field         | Type   |
| ------------- | ------ |
| images        | Array  |
| featuredImage | String |
| video         | String |


Description :

| Field       | Type   |
| ----------- | ------ |
| description | String |
| features    | Array  |


Inventory :

| Field    | Type    |
| -------- | ------- |
| status   | String  |
| type     | String  |
| featured | Boolean |


SEO :

| Field           | Type   |
| --------------- | ------ |
| metaTitle       | String |
| metaDescription | String |
| keywords        | Array  |



Audit :

| Field     | Type     |
| --------- | -------- |
| createdBy | ObjectId |
| updatedBy | ObjectId |
| createdAt | Date     |
| updatedAt | Date     |



-------------------------------------------------

Step 6 — Validation Rules

## Validation Rules

| Field        | Validation                                       |
| ------------ | ------------------------------------------------ |
| name         | Required, Min Length 3, Max Length 100           |
| brandId      | Required                                         |
| model        | Required                                         |
| slug         | Required, Unique                                 |
| year         | Required, Minimum 1990, Maximum Current Year + 1 |
| condition    | Required, Only "New" or "Used"                   |
| price        | Required, Greater than 0                         |
| currency     | Required                                         |
| mileage      | Minimum 0                                        |
| engine       | Required                                         |
| transmission | Required (Automatic / Manual)                    |
| fuelType     | Required (Petrol / Diesel / Hybrid / Electric)   |
| seats        | Minimum 1                                        |
| doors        | Minimum 2                                        |
| images       | Minimum 1 Image                                  |
| status       | Available / Sold / Reserved                      |
| type         | New Arrival / Cars For Sale / Previously Sold    |
| featured     | Default false                                    |


---------------------------------------------------------------------------------------

Step 7 — Indexes :

## Database Indexes

| Field     | Type         | Reason                  |
| --------- | ------------ | ----------------------- |
| slug      | Unique Index | SEO URL unique rahe     |
| brandId   | Index        | Brand search fast       |
| year      | Index        | Filter by year          |
| price     | Index        | Price filter            |
| status    | Index        | Available/Sold filter   |
| type      | Index        | Inventory tabs          |
| featured  | Index        | Home page featured cars |
| createdAt | Index        | Latest cars first       |


---------------------------------------------------------------------------


Step 8 — Relationships :

## Relationships

Brands (1)
     │
     ▼
Cars (Many)

Cars (1)
     │
     ├──► Leads (Many)
     ├──► Bookings (Many)
     └──► SellCars (Reference if needed)

Admins (1)
     │
     └──► Cars (Many)


--------------------------------------------------------------------------

Step 9 — Sample JSON :

## Sample JSON Document

{
  "name": "BMW X5",
  "brandId": "brand_object_id",
  "model": "X5",
  "year": 2024,
  "price": 12500000,
  "mileage": 8500,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "status": "Available",
  "type": "Cars For Sale",
  "featured": true
}


----------------------------------------------------------------

Step 10 — Mongoose Schema (Planning) :

## Mongoose Schema



---------------------------------------------------------------------

Step 11 — APIs :

## CRUD APIs


GET    /cars
GET    /cars/:id

POST   /cars

PUT    /cars/:id

DELETE /cars/:id

GET    /cars/search

GET    /cars/featured

GET    /cars/brand/:brandId


-----------------------------------------------------------------