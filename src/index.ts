// Import the generated items endpoint which has the enum import bug
// Chain: index.ts -> items/index.ts -> models/index.ts (ItemStatus)
import { ItemsRequestBuilderRequestsMetadata } from './client/items/index.js';

console.log('✅ Import worked!', ItemsRequestBuilderRequestsMetadata);
