GuardrailID=$(aws bedrock create-guardrail --name "my-guardrail" --blocked-input-messaging "Blocked." --blocked-outputs-messaging "Blocked." --content-policy-config '{"filtersConfig" : [{"type":"HATE","inputStrength":"HIGH","outputStrength":"HIGH"}]}' --profile "floci")

echo "$GuardrailID";