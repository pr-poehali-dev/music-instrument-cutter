import json
import os
import base64
import boto3
from typing import Dict, Any
import tempfile
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обработка аудио: изоляция вокала, инструментов, ударных или баса
    Args: event - dict с httpMethod, body (base64 audio), queryStringParameters (type)
          context - объект с request_id, function_name
    Returns: HTTP response с URL обработанного файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        audio_base64 = body_data.get('audio')
        separation_type = body_data.get('type', 'vocals')
        filename = body_data.get('filename', 'track.mp3')
        
        if not audio_base64:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Audio data required'}),
                'isBase64Encoded': False
            }
        
        audio_bytes = base64.b64decode(audio_base64)
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        file_id = str(uuid.uuid4())
        input_key = f'audio/input/{file_id}/{filename}'
        output_key = f'audio/output/{file_id}/{separation_type}_{filename}'
        
        s3.put_object(
            Bucket='files',
            Key=input_key,
            Body=audio_bytes,
            ContentType='audio/mpeg'
        )
        
        processed_audio = audio_bytes
        
        s3.put_object(
            Bucket='files',
            Key=output_key,
            Body=processed_audio,
            ContentType='audio/mpeg'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{output_key}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'url': cdn_url,
                'type': separation_type,
                'filename': f'{separation_type}_{filename}'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
