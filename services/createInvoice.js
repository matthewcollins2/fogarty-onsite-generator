import { waveRequest } from "./waveService.js";

export async function createInvoice(customerId, items) {

  const query = `
  mutation InvoiceCreate($input: InvoiceCreateInput!) {
    invoiceCreate(input: $input) {
      didSucceed
      inputErrors {
        message
        code
        path
      }
      invoice {
        id
        invoiceNumber
        viewUrl
        pdfUrl
      }
    }
  }`;

  console.log("Incoming items:", items);
  
  const variables = {
    input: {
      businessId: process.env.WAVE_BUSINESS_ID,
      customerId: customerId,

      items: items.map(item => ({
      productId: item.myproductId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.price.toString(), 
      }))
    }
  };

const data = await waveRequest(query, variables);

console.log("Wave raw response:", JSON.stringify(data, null, 2));

if (!data?.data?.invoiceCreate?.didSucceed) {
  console.error(
    "Wave invoice errors:",
    data?.data?.invoiceCreate?.inputErrors || "No inputErrors returned"
  );

  throw new Error("Wave invoice creation failed");
}

return data.data.invoiceCreate.invoice;
}