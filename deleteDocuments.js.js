// Import Firebase Admin SDK and initialize Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Ścieżka do Twojego klucza serwisowego

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import Node.js readline module for interactive user input
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions via the console
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Function to gather user inputs for deletion parameters
async function getUserInputs() {
  const collectionName = await askQuestion("Enter the collection name: ");
  const fieldName = await askQuestion("Enter the field name to check: ");
  const fieldValue = await askQuestion(`Enter the value for field "${fieldName}" to match: `);
  let batchSizeInput = await askQuestion("Enter the batch size (default 500): ");
  let delayInput = await askQuestion("Enter the delay between batches in milliseconds (default 0): ");
  
  const batchSize = batchSizeInput ? parseInt(batchSizeInput, 10) : 500;
  const delay = delayInput ? parseInt(delayInput, 10) : 0;
  
  return { collectionName, fieldName, fieldValue, batchSize, delay };
}

// Function that deletes documents in batches recursively.
// Now accepts a delay parameter to control the speed between each batch.
function deleteQueryBatch(db, query, delay, resolve, reject) {
  query.get()
    .then(snapshot => {
      if (snapshot.size === 0) {
        console.log('No documents found for deletion.');
        resolve();
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Commit the batch and, after a delay, schedule the next batch deletion
      return batch.commit().then(() => {
        console.log(`Deleted ${snapshot.size} documents...`);
        setTimeout(() => {
          deleteQueryBatch(db, query, delay, resolve, reject);
        }, delay);
      });
    })
    .catch(reject);
}

// Function to start the deletion process given the user-defined parameters
function deleteDocumentsWithSpecificValue(db, collectionPath, field, value, batchSize, delay) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef
    .where(field, '==', value)
    .orderBy('__name__')
    .limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, delay, resolve, reject);
  });
}

// Main execution: get the user inputs and trigger the deletion process
getUserInputs()
  .then(({ collectionName, fieldName, fieldValue, batchSize, delay }) => {
    console.log(`Starting deletion in collection "${collectionName}" where field "${fieldName}" equals "${fieldValue}". Batch size: ${batchSize}, Delay: ${delay}ms.`);
    rl.close();
    return deleteDocumentsWithSpecificValue(db, collectionName, fieldName, fieldValue, batchSize, delay);
  })
  .then(() => {
    console.log('Document deletion completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during document deletion:', error);
    process.exit(1);
  });
