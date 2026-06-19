import json
import boto3

bedrock_agent = boto3.client(
    service_name='bedrock-agent-runtime',
    region_name='ap-southeast-2'
)

bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='ap-southeast-2'
)

KNOWLEDGE_BASE_ID = 'MSO8IT9YH0'
MODEL_ID = 'amazon.nova-lite-v1:0'

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        question = body.get('question', '')

        if not question:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Question is required'})
            }

        # Step 1 - Retrieve relevant passages from Knowledge Base
        retrieve_response = bedrock_agent.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': question}
        )

        results = retrieve_response.get('retrievalResults', [])
        context_text = ''
        sources = []

        for result in results:
            content = result.get('content', {}).get('text', '')
            context_text += content + '\n\n'
            location = result.get('location', {})
            uri = location.get('s3Location', {}).get('uri', '')
            if uri and uri not in sources:
                sources.append(uri)

        # Step 2 - Generate answer using Nova Lite
        prompt = f"""You are a helpful healthcare assistant for Douglass Hanly Moir Pathology and Sonic Healthcare.

Answer the following question using ONLY the information provided below.
If the answer is not in the provided information, say "I don't have that information in my knowledge base. Please contact DHM directly on 1800 222 365."

Information:
{context_text}

Question: {question}

Answer:"""

        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps({
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {
                                'text': prompt
                            }
                        ]
                    }
                ],
                'inferenceConfig': {
                    'maxTokens': 512,
                    'temperature': 0.1
                }
            })
        )

        response_body = json.loads(response['body'].read())
        answer = response_body['output']['message']['content'][0]['text']

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'answer': answer,
                'sources': sources
            })
        }

    except Exception as e:
        print(f'Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
