# SheetManager

A lightweight ORM-style library for Google Apps Script that brings familiar data-mapper and repository patterns to your
spreadsheets. Built in TypeScript and compiled to a single JavaScript bundle, **SheetManager** lets you define schemas,
map rows to objects, run complex queries, and perform CRUD operations on your sheet data—just like an ORM.

---

## ⚙️ Installation

1. Copy the compiled `SheetManager` bundle into your Apps Script project (e.g. `SheetManager.js`).
2. In your script, include:

   ```js
   const { dataSource } = SheetManager;
   ```

3. Deploy or save your Apps Script project.

---

## 🚀 Quick Start

### 1. Define Your Entity Schema

```js
const userSchema = {
    selector: 'Users',          // sheet name or index
    ranges: {
        headers: 'A1:C1',         // optional A1 notation for header row
        data: null                // auto-calculated below headers
    },
    transform: {
        to: user => ({...user, createdAt: new Date()}),
        from: user => ({...user, createdAt: new Date(user.createdAt)})
    },
    columns: {
        id: {selector: 0, primary: true},
        name: {selector: 1},
        age: {selector: 2, transform: {from: v => Number(v)}}
    }
};
```

### 2. Initialize a DataSource

```js
const ds = dataSource({
    id: 'SPREADSHEET_ID',    // optional, defaults to active spreadsheet
    entities: [userSchema]
});
```

### 3. Get a Repository

```js
const userRepo = ds.getRepository('Users');
```

### 4. Insert Records

```js
userRepo.insertMany([
    {id: 1, name: 'Alice', age: 30},
    {id: 2, name: 'Bob', age: 25},
]);
```

### 5. Query Data

```js
// Get all users:
const allUsers = userRepo.find({});

// Find users age ≥ 26:
const adults = userRepo.find({age: {$gte: 26}});

// Find one user by id:
const alice = userRepo.findOne({id: 1});
```

The query syntax supports:

- **Direct equality**: `{ name: 'Bob' }`
- **Comparison operators**: `$gte`, `$lte`, `$gt`, `$lt`, `$ne`, `$in`, `$nin`
- **Logical operators**: `$and`, `$or`

```js
// Complex query: age ≥ 20 AND (name = 'Bob' OR id = 1)
const result = userRepo.find({
    $and: [
        {age: {$gte: 20}},
        {$or: [{name: 'Bob'}, {id: 1}]}
    ]
});
```

### 6. Delete and Sort

```js
// Delete all minors (age < 18):
const {deleted, counter} = userRepo.findAndDelete({age: {$lt: 18}});

// Delete a single user:
const delResult = userRepo.deleteOne({id: 2});

// Sort sheet by `age` descending:
userRepo.sort('age', false);
```

---

## 📜 API Reference

### `dataSource(options)`

- **options.id** (`string?`): Spreadsheet ID.
- **options.entities** (`EntitySchemaOptions[]`): List of entity schemas.

Returns a **DataSource** instance.

#### `DataSource.getRepository(selector)`

- **selector** (`string|number`): Sheet name or zero-based index.

Returns a **Repository<Entity>** for the specified sheet.

### `Repository<Entity>` Methods

- **`find(filter)`** → `Entity[]`
- **`findOne(filter)`** → `Entity | null`
- **`findAndDelete(filter)`** → `{ deleted: boolean, indexes: number[], counter: number }`
- **`deleteOne(filter)`** → same shape
- **`insert(entity)`**
- **`insertMany(entities[])`**
- **`sort(key, ascending?)`**

> **filter** is a _FindObject_ supporting nested `$and/$or` and comparison operators.

---

## 🤝 Contributing

- The library is authored in TypeScript; you can find the TS source in the repo.
- Feel free to open issues or pull requests for new features, bug fixes, or enhancements.

---

