const hash = require("object-hash");
const Schema = require("validate");
const nano = require("nano");

// Function to generate validation schema
const generateSchema = () => {
  return new Schema({
    user_name: { type: String, required: true },
    password: { type: String, required: true },
    service_url: { type: String, required: true },
    service_port: { type: Number, required: true },
    db_name: { type: String, required: true },
  });
};

// Function to validate data against schema
const validateDbmodel = async (data) => {
  try {
    const schema = generateSchema();
    await schema.validate(data);
  } catch (error) {
    throw new Error("Model Validation error");
  }
};

// Function to create nano db connection
const dbconnectionMaker = async (user, password, url, port) => {
  const connection = nano(`http://${user}:${password}@${url}:${port}`);
  return connection;
};

// Function to check if a database exists
const checkDbexist = async (connection, db) => {
  try {
    await connection.db.get(db);
    return true;
  } catch (error) {
    if (error.statusCode != undefined && error.statusCode == 404) {
      return false;
    }
    throw error;
  }
};

// Function to create a database
const dbcreate = async (connection, db) => {
  try {
    await connection.db.create(db);
  } catch (error) {
    throw error;
  }
};

// Function to select a database
const selectDb = async (connection, dbname) => {
  const selectedDb = connection.db.use(dbname);
  return selectedDb;
};

// Function to check if a document exists
const checkDocumentExist = async (selectDb, id) => {
  try {
    const doc = await selectDb.get(id);
    return doc;
  } catch (error) {
    if (error.statusCode != undefined && error.statusCode == 404) {
      return false;
    }
    throw error;
  }
};

// Function to insert a document
const insertDocument = async (selectDb, doc) => {
  try {
    const insert = await selectDb.insert(doc);
    return insert;
  } catch (error) {
    throw error;
  }
};

// Main function to create databases and handle documents
const createDB = async (config) => {
  const infologs = [];
  for (const singleElement of config) {
    const loopinfo = {};

    try {
      await validateDbmodel(singleElement);

      const db = await dbconnectionMaker(singleElement.user_name, singleElement.password, singleElement.service_url, singleElement.service_port);

      let dbexist = await checkDbexist(db, singleElement.db_name);
      loopinfo["dbexist"] = dbexist;

      if (!dbexist) {
        await dbcreate(db, singleElement.db_name);
        loopinfo["create db"] = true;
      }

      const select_db = await selectDb(db, singleElement.db_name);

      // Handle view_document
      if (singleElement.view_document && singleElement.view_document._id) {
        let viewDoc = await checkDocumentExist(select_db, singleElement.view_document._id);
        if (!viewDoc) {
          await insertDocument(select_db, singleElement.view_document);
          loopinfo["view_document"] = "Document not found insert as new";
        } else {
          const rev = viewDoc._rev;
          delete viewDoc._rev;
          const dbhash = hash(viewDoc);
          const viewModelhash = hash(singleElement.view_document);
          if (dbhash !== viewModelhash) {
            singleElement.view_document._rev = rev;
            await insertDocument(select_db, singleElement.view_document);
            loopinfo["view_document"] = "Document found does not equal old one";
          } else {
            loopinfo["view_document"] = "Document found equals old one";
          }
        }
      }

      // Handle index_document
      if (singleElement.index_document && singleElement.index_document._id) {
        let doc = await checkDocumentExist(select_db, singleElement.index_document._id);
        if (!doc) {
          await insertDocument(select_db, singleElement.index_document);
          loopinfo["index_document"] = "Document not found insert as new";
        } else {
          const rev = doc._rev;
          delete doc._rev;
          const dbhash = hash(doc);
          const Modelhash = hash(singleElement.index_document);
          if (dbhash !== Modelhash) {
            singleElement.index_document._rev = rev;
            await insertDocument(select_db, singleElement.index_document);
            loopinfo["index_document"] = "Document found does not equal old one";
          } else {
            loopinfo["index_document"] = "Document found equals old one";
          }
        }
      }

      // Handle update_handler
      if (singleElement.update_handler && singleElement.update_handler._id) {
        let doc = await checkDocumentExist(select_db, singleElement.update_handler._id);
        if (!doc) {
          await insertDocument(select_db, singleElement.update_handler);
          loopinfo["Update_handler_document"] = "Document not found insert as new";
        } else {
          const rev = doc._rev;
          delete doc._rev;
          const dbhash = hash(doc);
          const Modelhash = hash(singleElement.update_handler);
          if (dbhash !== Modelhash) {
            singleElement.update_handler._rev = rev;
            await insertDocument(select_db, singleElement.update_handler);
            loopinfo["Update_handler_document"] = "Document found does not equal old one";
          } else {
            loopinfo["Update_handler_document"] = "Document found equals old one";
          }
        }
      }

      infologs.push(loopinfo);
    } catch (error) {
      throw error;
    }
  }
  return infologs;
};

module.exports = {
  createDB,
};
