#!/usr/bin/env node

/**
 * Script to drop the unique compound index on (event, sponsor) from SponsorshipProposal collection
 * This allows sponsors to submit multiple proposals for the same event
 * Run: node drop-proposal-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function dropIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;
    const collection = db.collection('sponsorshipproposals');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\nExisting indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the unique compound index
    try {
      await collection.dropIndex('event_1_sponsor_1');
      console.log('\n✅ Successfully dropped unique index: event_1_sponsor_1');
    } catch (err) {
      if (err.code === 27 || err.codeName === 'IndexNotFound') {
        console.log('\nℹ️  Index event_1_sponsor_1 does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // Show updated indexes
    const updatedIndexes = await collection.indexes();
    console.log('\nUpdated indexes:');
    updatedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropIndex();
