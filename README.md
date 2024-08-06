CouchDB Management Tool

A Node.js package for managing CouchDB databases. This tool automates the creation of databases, adding or updating views, and indexing documents in CouchDB.

Features
Database Creation: Automatically create databases in CouchDB.
View Management: Add or update views within existing databases.
Document Indexing: Index documents to enhance query performance.

Installation

How to use it

```bash
const couchdbManager = require("couchdb-manager");
let viewDoc = {
  _id: "_design/view",
  views: {
    all: {
      map: "function (doc) { emit(doc._id, 1);}",
    },
  },
  language: "javascript",
};

const dbs = [
  {
    user_name: "root",
    password: "root",
    service_url: "localhost", // assume db host in localhost just use localhost
    service_port: 5000,
    db_name: "test",
    view_document: viewDoc,
  },
];

const create = async () => {
try {
  var x = await couchdbManager.createDB(dbs);
    console.log("appboot db create info", x);
  } catch (error) {
    console.log(" appboot db create error", error);
  }
};

create();

```
