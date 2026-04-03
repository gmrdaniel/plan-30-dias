import json, urllib.request, ssl, os

ctx = ssl.create_default_context()
token = os.environ.get('HUBSPOT_ACCESS_TOKEN', '')
if not token:
    raise SystemExit('Error: set HUBSPOT_ACCESS_TOKEN environment variable before running this script')
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 1. Create group
group_payload = json.dumps({'name': 'outreach_pipeline', 'label': 'Outreach Pipeline', 'displayOrder': 1})
req = urllib.request.Request('https://api.hubapi.com/crm/v3/properties/contacts/groups',
    data=group_payload.encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        print("Grupo 'Outreach Pipeline' creado")
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    if 'already exists' in body or 'CONFLICT' in body:
        print("Grupo ya existe")
    else:
        print(f"Error grupo: {body}")

# 2. Properties
properties = [
    {
        'name': 'lead_source',
        'label': 'Lead Source',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Origin of the contact',
        'options': [
            {'label': 'Clay', 'value': 'Clay', 'displayOrder': 0},
            {'label': 'SmartScout', 'value': 'SmartScout', 'displayOrder': 1},
            {'label': 'Apify', 'value': 'Apify', 'displayOrder': 2},
            {'label': 'ManyChat', 'value': 'ManyChat', 'displayOrder': 3},
            {'label': 'Referral', 'value': 'Referral', 'displayOrder': 4},
            {'label': 'Inbound', 'value': 'Inbound', 'displayOrder': 5},
            {'label': 'Manual', 'value': 'Manual', 'displayOrder': 6},
        ]
    },
    {
        'name': 'icp_score',
        'label': 'ICP Score',
        'type': 'number',
        'fieldType': 'number',
        'groupName': 'outreach_pipeline',
        'description': 'Ideal Customer Profile score 1-10 from Clay AI Sculptor',
    },
    {
        'name': 'video_gap_score',
        'label': 'Video Gap Score',
        'type': 'number',
        'fieldType': 'number',
        'groupName': 'outreach_pipeline',
        'description': 'Video opportunity score 1-10 from SmartScout data',
    },
    {
        'name': 'first_contact_channel',
        'label': 'First Contact Channel',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Channel through which the contact was first reached',
        'options': [
            {'label': 'Email', 'value': 'Email', 'displayOrder': 0},
            {'label': 'LinkedIn', 'value': 'LinkedIn', 'displayOrder': 1},
            {'label': 'Instagram', 'value': 'Instagram', 'displayOrder': 2},
            {'label': 'WhatsApp', 'value': 'WhatsApp', 'displayOrder': 3},
            {'label': 'Phone', 'value': 'Phone', 'displayOrder': 4},
            {'label': 'SMS', 'value': 'SMS', 'displayOrder': 5},
        ]
    },
    {
        'name': 'team_owner',
        'label': 'Team Owner',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Internal team responsible for this contact',
        'options': [
            {'label': 'Marketing Influencers', 'value': 'Marketing Influencers', 'displayOrder': 0},
            {'label': 'Creators', 'value': 'Creators', 'displayOrder': 1},
            {'label': 'Infrastructure', 'value': 'Infrastructure', 'displayOrder': 2},
            {'label': 'Content', 'value': 'Content', 'displayOrder': 3},
        ]
    },
    {
        'name': 'pipeline_type',
        'label': 'Pipeline Type',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Which pipeline this contact belongs to',
        'options': [
            {'label': 'B2B', 'value': 'b2b', 'displayOrder': 0},
            {'label': 'Creators', 'value': 'creators', 'displayOrder': 1},
        ]
    },
    {
        'name': 'outreach_status',
        'label': 'Outreach Status',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Current status in the outreach sequence',
        'options': [
            {'label': 'New', 'value': 'new', 'displayOrder': 0},
            {'label': 'Sequence Active', 'value': 'sequence_active', 'displayOrder': 1},
            {'label': 'Replied', 'value': 'replied', 'displayOrder': 2},
            {'label': 'No Response', 'value': 'no_response', 'displayOrder': 3},
            {'label': 'Nurture', 'value': 'nurture', 'displayOrder': 4},
            {'label': 'Converted', 'value': 'converted', 'displayOrder': 5},
        ]
    },
    {
        'name': 'linkedin_url',
        'label': 'LinkedIn URL',
        'type': 'string',
        'fieldType': 'text',
        'groupName': 'outreach_pipeline',
        'description': 'LinkedIn profile URL. Required for Expandi sync.',
    },
    {
        'name': 'contact_job_title',
        'label': 'Job Title',
        'type': 'string',
        'fieldType': 'text',
        'groupName': 'outreach_pipeline',
        'description': 'Job title enriched by Clay and synced by Expandi',
    },
    {
        'name': 'classification',
        'label': 'Classification',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Business classification from Clay/SmartScout',
        'options': [
            {'label': 'Private Label', 'value': 'private_label', 'displayOrder': 0},
            {'label': 'Manufacturer', 'value': 'manufacturer', 'displayOrder': 1},
            {'label': 'Distributor', 'value': 'distributor', 'displayOrder': 2},
            {'label': 'Reseller', 'value': 'reseller', 'displayOrder': 3},
            {'label': 'Brand', 'value': 'brand', 'displayOrder': 4},
            {'label': 'Agency', 'value': 'agency', 'displayOrder': 5},
            {'label': 'Other', 'value': 'other', 'displayOrder': 6},
        ]
    },
    {
        'name': 'contact_country',
        'label': 'Country',
        'type': 'string',
        'fieldType': 'text',
        'groupName': 'outreach_pipeline',
        'description': 'Country from Clay. Used for WhatsApp LatAm vs US segmentation.',
    },
    {
        'name': 'creator_platform',
        'label': 'Creator Platform',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Primary social platform (Creators pipeline only)',
        'options': [
            {'label': 'YouTube', 'value': 'youtube', 'displayOrder': 0},
            {'label': 'TikTok', 'value': 'tiktok', 'displayOrder': 1},
            {'label': 'Instagram', 'value': 'instagram', 'displayOrder': 2},
            {'label': 'Twitch', 'value': 'twitch', 'displayOrder': 3},
        ]
    },
    {
        'name': 'creator_followers',
        'label': 'Creator Followers',
        'type': 'number',
        'fieldType': 'number',
        'groupName': 'outreach_pipeline',
        'description': 'Follower count on primary platform (Creators pipeline only)',
    },
    {
        'name': 'creator_language',
        'label': 'Creator Language',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Primary content language (Creators pipeline only)',
        'options': [
            {'label': 'English', 'value': 'en', 'displayOrder': 0},
            {'label': 'Spanish', 'value': 'es', 'displayOrder': 1},
            {'label': 'Portuguese', 'value': 'pt', 'displayOrder': 2},
            {'label': 'Other', 'value': 'other', 'displayOrder': 3},
        ]
    },
    {
        'name': 'email_valid',
        'label': 'Email Valid',
        'type': 'enumeration',
        'fieldType': 'select',
        'groupName': 'outreach_pipeline',
        'description': 'Email validation result from Clay ZeroBounce',
        'options': [
            {'label': 'True', 'value': 'true', 'displayOrder': 0},
            {'label': 'False', 'value': 'false', 'displayOrder': 1},
            {'label': 'Pending', 'value': 'pending', 'displayOrder': 2},
        ]
    },
]

created = 0
errors = 0
for p in properties:
    payload = json.dumps(p)
    req = urllib.request.Request('https://api.hubapi.com/crm/v3/properties/contacts',
        data=payload.encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            created += 1
            print(f"  OK | {p['name']}")
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        errors += 1
        print(f"  ERROR | {p['name']}: {body[:150]}")

print(f"\nCreadas: {created}/15")
print(f"Errores: {errors}")
