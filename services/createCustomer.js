import { waveRequest } from "./waveService.js";

export async function createCustomer(name, email) {
  // find existing customers
  const findCustomerQuery = `
  query {
    business(id: "${process.env.WAVE_BUSINESS_ID}") {
      customers {
        edges {
          node {
            id
            name
            email
          }
        }
      }
    }
  }`;

  const existingCustomers = await waveRequest(findCustomerQuery);
  const customers = existingCustomers.data.business.customers.edges.map(edge => edge.node);

  // Check if customer exists
  const existing = customers.find(
    c =>
      c.email?.toLowerCase() === email.toLowerCase() &&
      c.name?.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    console.log("Customer already exists:", existing);
    return existing; 
  }
  
  // Create new customer
  const createCustomerMutation = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      didSucceed
      inputErrors {
        message
        code
        path
      }
      customer {
        id
        name
        email
      }
    }
  }`;

  const variables = {
    input: {
      businessId: process.env.WAVE_BUSINESS_ID,
      name: name,
      email: email
    }
  };

  const data = await waveRequest(createCustomerMutation, variables);

  if (!data.data.customerCreate.didSucceed) {
    throw new Error("Wave customer creation failed");
  }

  console.log("Created new customer:", data.data.customerCreate.customer);

  return data.data.customerCreate.customer;
}