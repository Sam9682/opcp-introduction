mod config;
mod client;

use opcua::types::{NodeId, Variant};
use crate::config::OpcUaConfig;
use crate::client::OpcUaClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load configuration
    let config = OpcUaConfig::default();
    
    // Create a new client
    let client = OpcUaClient::new(config).await?;
    
    // Connect to the server
    client.connect().await?;
    
    println!("Connected to OPC UA server successfully!");

    // Example: Read a node value (Root node)
    let node_id = NodeId::from(0u32); // Root node
    let value = client.read_node_value(&node_id).await?;
    
    match value {
        Some(variant) => {
            println!("Value: {:?}", variant);
        }
        None => {
            println!("No value found for node");
        }
    }

    // Disconnect from the server
    client.disconnect().await?;
    
    Ok(())
}
