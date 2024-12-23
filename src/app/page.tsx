import { shopifyClient } from "@/libs/shopify";
import { flattenConnection, Image } from "@shopify/hydrogen-react";
import { Product } from "@shopify/hydrogen-react/storefront-api-types";

export default async function Home() {
  const response = await fetch(shopifyClient.getStorefrontApiUrl(), {
    body: JSON.stringify({
      query:
        /* GraphQL */
        `
          query {
            products(first: 200) {
              edges {
                node {
                  id
                  title
                  handle
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        originalSrc
                        url
                        src
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
    }),
    // Generate the headers using the private token.
    headers: shopifyClient.getPublicTokenHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const products = flattenConnection(json.data.products) as Product[];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id}>
          <Image
            src={product.images.edges[0].node.url}
            alt={product.images.edges[0].node.altText || product.title}
            loading="eager"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33.333vw, (min-width: 640px) 50vw, 100vw"
          />
          <p>{product.title}</p>
          <p>{product.priceRange.minVariantPrice.amount}</p>
        </div>
      ))}
    </div>
  );
}
