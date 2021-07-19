const express = require('express');

const fs = require('fs');

const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();

// parse incoming string or array data

app.use(express.urlencoded({ extended: true }));

// parse incoming JSON data

app.use(express.json());

const { animals } = require('./data/animals');

function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array
    // If personalityTraits is a string, place it into a new array
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    );
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    );
  }
  return filteredResults;
}

function findById(id, animalsArray) {
  const result = animalsArray.filter((animal) => animal.id === id)[0];
  return result;
}

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

// add an animal to json file and animals array in this function
function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray }, null, 2)
  );
  return animal;
}

app.get('/api/animals', (req, res) => {
  let results = animals;
  console.log(req.query);
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

app.post('/api/animals', (req, res) => {
  // req.body is where our incoming content will be
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString(); // this only works if no data is removed, otherwise id's will be thrown off

  // if any data in the req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted');
  } else {
    const animal = createNewAnimal(req.body, animals);
    res.json(req.body);
  }
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}`);
});

// knowing the difference between params and query
// /animals/:id
// /animals/123/?id=24&params=50
// params --> 123, query --> {id: 24, params: 50}

// http://localhost:3001/api/animals?name=Erica&a=111&b=222&b=111&b=inside_the_array&c=333
// this will return
const request_query = {
  name: 'Erica',
  a: '111',
  b: ['222', '111', 'inside_the_array'],
  c: '333',
};

const post_json = {
  name: 'Larry',
  species: 'lemur',
  diet: 'omnivore',
  personalityTraits: ['hungry'],
};
