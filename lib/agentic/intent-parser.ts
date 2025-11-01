import { Intent, Entity, Relationship, Operation } from './types';

const KEYWORDS: Record<string, { entities: string[]; operations: string[] }> = {
  // Invoice & Billing
  invoice: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice', 'CollectPayment'] },
  invoices: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice', 'CollectPayment'] },
  bill: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice'] },
  billing: { entities: ['Invoice', 'Client', 'Payment'], operations: ['CreateInvoice', 'SendInvoice'] },
  
  // Client & Customer Management
  client: { entities: ['Client'], operations: ['CreateClient', 'UpdateClient'] },
  clients: { entities: ['Client'], operations: ['CreateClient', 'UpdateClient'] },
  customer: { entities: ['Customer'], operations: ['CreateCustomer', 'UpdateCustomer'] },
  customers: { entities: ['Customer'], operations: ['CreateCustomer', 'UpdateCustomer'] },
  
  // Project & Task Management
  project: { entities: ['Project', 'Task', 'User'], operations: ['CreateProject', 'CreateTask', 'AssignTask'] },
  projects: { entities: ['Project', 'Task', 'User'], operations: ['CreateProject', 'CreateTask', 'AssignTask'] },
  task: { entities: ['Task', 'User'], operations: ['CreateTask', 'AssignTask', 'CompleteTask'] },
  tasks: { entities: ['Task', 'User'], operations: ['CreateTask', 'AssignTask', 'CompleteTask'] },
  todo: { entities: ['Task'], operations: ['CreateTask', 'CompleteTask'] },
  
  // Team & User Management
  team: { entities: ['Team', 'User'], operations: ['InviteUser', 'AssignRole'] },
  teams: { entities: ['Team', 'User'], operations: ['InviteUser', 'AssignRole'] },
  user: { entities: ['User'], operations: ['CreateUser', 'UpdateUser'] },
  users: { entities: ['User'], operations: ['CreateUser', 'UpdateUser'] },
  member: { entities: ['User', 'Team'], operations: ['InviteUser', 'AssignRole'] },
  
  // Payments & Subscriptions
  payment: { entities: ['Payment', 'Customer'], operations: ['CollectPayment', 'RefundPayment'] },
  payments: { entities: ['Payment', 'Customer'], operations: ['CollectPayment', 'RefundPayment'] },
  subscription: { entities: ['Subscription', 'Customer', 'Payment'], operations: ['CreateSubscription', 'CancelSubscription'] },
  subscriptions: { entities: ['Subscription', 'Customer', 'Payment'], operations: ['CreateSubscription', 'CancelSubscription'] },
  subscribe: { entities: ['Subscription', 'Customer', 'Payment'], operations: ['CreateSubscription', 'CancelSubscription'] },
  subscribers: { entities: ['Subscription', 'Customer', 'Payment'], operations: ['CreateSubscription', 'CancelSubscription'] },
  plan: { entities: ['Plan', 'Subscription'], operations: ['CreatePlan', 'UpdatePlan'] },
  plans: { entities: ['Plan', 'Subscription'], operations: ['CreatePlan', 'UpdatePlan'] },
  
  // Content & Documents
  document: { entities: ['Document', 'User'], operations: ['CreateDocument', 'ShareDocument'] },
  documents: { entities: ['Document', 'User'], operations: ['CreateDocument', 'ShareDocument'] },
  file: { entities: ['File', 'User'], operations: ['UploadFile', 'ShareFile'] },
  files: { entities: ['File', 'User'], operations: ['UploadFile', 'ShareFile'] },
  post: { entities: ['Post', 'User'], operations: ['CreatePost', 'PublishPost'] },
  posts: { entities: ['Post', 'User'], operations: ['CreatePost', 'PublishPost'] },
  
  // E-commerce
  product: { entities: ['Product', 'Order'], operations: ['CreateProduct', 'UpdateProduct'] },
  products: { entities: ['Product', 'Order'], operations: ['CreateProduct', 'UpdateProduct'] },
  order: { entities: ['Order', 'Customer', 'Product'], operations: ['CreateOrder', 'FulfillOrder'] },
  orders: { entities: ['Order', 'Customer', 'Product'], operations: ['CreateOrder', 'FulfillOrder'] },
  cart: { entities: ['Cart', 'Product', 'Customer'], operations: ['AddToCart', 'Checkout'] },
  
  // CRM & Sales
  lead: { entities: ['Lead', 'User'], operations: ['CreateLead', 'QualifyLead'] },
  leads: { entities: ['Lead', 'User'], operations: ['CreateLead', 'QualifyLead'] },
  contact: { entities: ['Contact', 'User'], operations: ['CreateContact', 'UpdateContact'] },
  contacts: { entities: ['Contact', 'User'], operations: ['CreateContact', 'UpdateContact'] },
  deal: { entities: ['Deal', 'Contact', 'User'], operations: ['CreateDeal', 'CloseDeal'] },
  
  // Events & Booking
  event: { entities: ['Event', 'User'], operations: ['CreateEvent', 'RegisterEvent'] },
  events: { entities: ['Event', 'User'], operations: ['CreateEvent', 'RegisterEvent'] },
  booking: { entities: ['Booking', 'User'], operations: ['CreateBooking', 'CancelBooking'] },
  bookings: { entities: ['Booking', 'User'], operations: ['CreateBooking', 'CancelBooking'] },
  appointment: { entities: ['Appointment', 'User'], operations: ['ScheduleAppointment', 'CancelAppointment'] },
  schedule: { entities: ['Booking', 'Appointment', 'User'], operations: ['ScheduleAppointment', 'CreateBooking'] },
  scheduled: { entities: ['Booking', 'Appointment', 'User'], operations: ['ScheduleAppointment'] },
  book: { entities: ['Booking', 'User'], operations: ['CreateBooking', 'CancelBooking'] },
  books: { entities: ['Booking', 'User'], operations: ['CreateBooking', 'CancelBooking'] },
  reservation: { entities: ['Reservation', 'User'], operations: ['CreateReservation', 'CancelReservation'] },
  reservations: { entities: ['Reservation', 'User'], operations: ['CreateReservation', 'CancelReservation'] },
};

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function parseIntent(raw: string): Intent {
  const lower = raw.toLowerCase();

  const foundEntities = new Array<string>();
  const foundOperations = new Array<string>();

  for (const [kw, data] of Object.entries(KEYWORDS)) {
    if (lower.includes(kw)) {
      foundEntities.push(...data.entities);
      foundOperations.push(...data.operations);
    }
  }

  // Default entity if nothing matched
  const entities: Entity[] = unique(foundEntities.length ? foundEntities : ['Record']).map((name) => ({ name }));

  // Infer relationships based on common patterns
  const relationships: Relationship[] = [];
  const has = (name: string) => entities.some((e) => e.name === name);
  
  // Invoice/Billing relationships
  if (has('Invoice') && has('Client')) relationships.push({ from: 'Invoice', to: 'Client', type: 'many-to-one' });
  if (has('Invoice') && has('Customer')) relationships.push({ from: 'Invoice', to: 'Customer', type: 'many-to-one' });
  if (has('Invoice') && has('Payment')) relationships.push({ from: 'Payment', to: 'Invoice', type: 'many-to-one' });
  
  // Project/Task relationships
  if (has('Project') && has('Task')) relationships.push({ from: 'Task', to: 'Project', type: 'many-to-one' });
  if (has('Task') && has('User')) relationships.push({ from: 'Task', to: 'User', type: 'many-to-one' });
  
  // Team/User relationships
  if (has('User') && has('Team')) relationships.push({ from: 'User', to: 'Team', type: 'many-to-many' });
  
  // Payment/Subscription relationships
  if (has('Payment') && has('Customer')) relationships.push({ from: 'Payment', to: 'Customer', type: 'many-to-one' });
  if (has('Subscription') && has('Customer')) relationships.push({ from: 'Subscription', to: 'Customer', type: 'many-to-one' });
  if (has('Payment') && has('Subscription')) relationships.push({ from: 'Payment', to: 'Subscription', type: 'many-to-one' });
  
  // Document/File relationships
  if (has('Document') && has('User')) relationships.push({ from: 'Document', to: 'User', type: 'many-to-one' });
  if (has('File') && has('User')) relationships.push({ from: 'File', to: 'User', type: 'many-to-one' });
  if (has('Post') && has('User')) relationships.push({ from: 'Post', to: 'User', type: 'many-to-one' });
  
  // E-commerce relationships
  if (has('Product') && has('Order')) relationships.push({ from: 'Order', to: 'Product', type: 'many-to-many' });
  if (has('Order') && has('Customer')) relationships.push({ from: 'Order', to: 'Customer', type: 'many-to-one' });
  if (has('Cart') && has('Customer')) relationships.push({ from: 'Cart', to: 'Customer', type: 'one-to-one' });
  if (has('Cart') && has('Product')) relationships.push({ from: 'Cart', to: 'Product', type: 'many-to-many' });
  
  // CRM relationships
  if (has('Lead') && has('User')) relationships.push({ from: 'Lead', to: 'User', type: 'many-to-one' });
  if (has('Contact') && has('User')) relationships.push({ from: 'Contact', to: 'User', type: 'many-to-one' });
  if (has('Deal') && has('Contact')) relationships.push({ from: 'Deal', to: 'Contact', type: 'many-to-one' });
  if (has('Deal') && has('User')) relationships.push({ from: 'Deal', to: 'User', type: 'many-to-one' });
  
  // Event/Booking relationships
  if (has('Event') && has('User')) relationships.push({ from: 'Event', to: 'User', type: 'many-to-many' });
  if (has('Booking') && has('User')) relationships.push({ from: 'Booking', to: 'User', type: 'many-to-one' });
  if (has('Appointment') && has('User')) relationships.push({ from: 'Appointment', to: 'User', type: 'many-to-one' });

  const operations: Operation[] = unique(foundOperations.length ? foundOperations : ['CreateRecord']).map((name) => ({ name }));

  const questions: string[] = [];
  if (has('Payment') || has('Subscription')) {
    questions.push('Should customers pay as guests or require accounts? (guest/accounts)');
    questions.push('Do you need recurring billing? (yes/no)');
  }
  if (has('Team')) {
    questions.push('Do teams need role-based permissions? (yes/no)');
  }
  if (has('Order') || has('Product')) {
    questions.push('Do products have inventory tracking? (yes/no)');
  }
  if (has('Booking') || has('Appointment')) {
    questions.push('Should bookings require approval? (auto-approve/manual)');
  }

  return {
    raw,
    entities,
    relationships,
    operations,
    questions,
  };
}

export default parseIntent;
