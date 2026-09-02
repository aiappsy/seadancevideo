import { SettingsService } from "./services/settings";

/**
 * Helper to interact with PayPal REST API dynamically using Firestore settings.
 */
export async function getPayPalBaseUrl() {
  const settings = await SettingsService.getSettings();
  const isLive = settings.billing.paypal.mode === "live";
  return isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken() {
  const settings = await SettingsService.getSettings();
  const { clientId, clientSecret, mode } = settings.billing.paypal;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal Client ID or Secret is not configured in Admin Settings.");
  }

  const baseUrl = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal OAuth failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createPayPalOrder({ planId, amount, currency = "USD", description, customId }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = await getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planId,
          custom_id: customId, // Store userId and planId
          description: description || "Seedance Video Generation Plan",
          amount: {
            currency_code: currency.toUpperCase(),
            value: parseFloat(amount).toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create PayPal order: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = await getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to capture PayPal order: ${response.status} ${errorText}`);
  }

  return await response.json();
}
