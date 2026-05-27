//! OPC UA client module

use opcua::client::{Client, ClientBuilder};
use opcua::types::{NodeId, Variant};
use crate::config::OpcUaConfig;

/// OPC UA Client wrapper
pub struct OpcUaClient {
    client: Client,
    config: OpcUaConfig,
}

impl OpcUaClient {
    /// Creates a new OPC UA client
    pub async fn new(config: OpcUaConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let client = ClientBuilder::new()
            .application_name(&config.application_name)
            .application_uri(&config.application_uri)
            .connect_to_endpoint(&config.endpoint_url)
            .await?;

        Ok(Self { client, config })
    }

    /// Connects to the OPC UA server
    pub async fn connect(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.client.connect().await?;
        Ok(())
    }

    /// Disconnects from the OPC UA server
    pub async fn disconnect(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.client.disconnect().await?;
        Ok(())
    }

    /// Reads a value from a node
    pub async fn read_node_value(&self, node_id: &NodeId) -> Result<Option<Variant>, Box<dyn std::error::Error>> {
        let value = self.client.read_value(node_id).await?;
        Ok(value)
    }

    /// Writes a value to a node
    pub async fn write_node_value(&self, node_id: &NodeId, value: &Variant) -> Result<(), Box<dyn std::error::Error>> {
        self.client.write_value(node_id, value).await?;
        Ok(())
    }
}