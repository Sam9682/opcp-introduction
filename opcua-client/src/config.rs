//! Configuration module for OPC UA client settings

/// Configuration struct for OPC UA client
#[derive(Debug, Clone)]
pub struct OpcUaConfig {
    /// OPC UA server endpoint URL
    pub endpoint_url: String,
    /// Application name
    pub application_name: String,
    /// Application URI
    pub application_uri: String,
}

impl Default for OpcUaConfig {
    fn default() -> Self {
        Self {
            endpoint_url: "opc.tcp://localhost:4840".to_string(),
            application_name: "OPC UA Client".to_string(),
            application_uri: "urn:localhost:opcua:client".to_string(),
        }
    }
}