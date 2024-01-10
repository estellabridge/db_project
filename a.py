import json
import pymssql
import cryptography

conn = pymssql.connect(server='localhost', user='SA', password='1q2w3e4r@@', port='12000' ,database='restaurant_service', charset='utf8')
cursor = conn.cursor()


with open('response_1701785083951.json', 'r', encoding='utf-8') as file:
    datas = json.load(file)

    data = datas['response']['body']['items']['item']

    attribute_for_restaurant = []
    attribute_for_location = []
    attribute_for_category = []
    attribute_for_cnt = []


    for k in data:

        attribute_for_restaurant.append([k['CON_UID'], k['CON_TITLE'], k['CON_HOMEPAGE'],  k['CON_SUMMARY'],  k['CON_CONTENT'],k['CON_PHONE'],k['CON_IMGFILENAME'], k['SRC_TITLE']])
        attribute_for_location.append([k['CON_UID'], k['CON_ADDRESS'], k['CON_LATITUDE'],  k['CON_LONGITUDE']])
        attribute_for_category.append([k['CON_UID'], k['CODE_UID'], k['CODE_NAME'],  k['CON_KEYWORDS']])
        attribute_for_cnt.append([k['CON_UID'], k['CON_READCNT'], k['CON_LIKECNT']])


def insert_attribute_to_restaurant(attribute_for_restaurant):
    try:
        for j in attribute_for_restaurant:
            cursor.execute(f"SELECT * FROM restaurant WHERE CON_UID = '{j[0]}'")
            rows = cursor.fetchall()
            if(len(rows) > 0):
                pass

            sql = f'''INSERT INTO restaurant VALUES 
            ('{j[0]}', '{j[1]}', '{j[2]}', '{j[3]}', '{j[4]}', '{j[5]}', '{j[6]}', '{j[7]}')'''
            cursor.execute(sql)
            conn.commit()

    except Exception as e:
        # 예외가 발생하면 롤백 수행
        print(f"Error: {e}")
        conn.rollback()

def insert_attribute_to_location(attribute_for_location):
    try:
        for j in attribute_for_location:
            cursor.execute(f"SELECT * FROM location WHERE CON_UID = '{j[0]}'")
            rows = cursor.fetchall()
            if(len(rows) > 0):
                pass

            sql = f'''INSERT INTO location VALUES 
            ('{j[0]}', '{j[1]}', '{j[2]}', '{j[3]}')'''
            cursor.execute(sql)
            conn.commit()

    except Exception as e:
        # 예외가 발생하면 롤백 수행
        print(f"Error: {e}")
        conn.rollback()

def insert_attribute_to_category(attribute_for_category):
    try:
        for j in attribute_for_category:
            cursor.execute(f"SELECT * FROM category WHERE CON_UID = '{j[0]}'")
            rows = cursor.fetchall()
            if(len(rows) > 0):
                pass

            sql = f'''INSERT INTO category VALUES 
            ('{j[0]}', '{j[1]}', '{j[2]}', '{j[3]}')'''
            cursor.execute(sql)
            conn.commit()

    except Exception as e:
        # 예외가 발생하면 롤백 수행
        print(f"Error: {e}")
        conn.rollback()

def insert_attribute_to_cnt(attribute_for_cnt):
    try:
        for j in attribute_for_cnt:
            cursor.execute(f"SELECT * FROM cnt WHERE CON_UID = '{j[0]}'")
            rows = cursor.fetchall()
            if(len(rows) > 0):
                pass

            sql = f'''INSERT INTO cnt VALUES 
            ('{j[0]}', '{j[1]}', '{j[2]}')'''
            cursor.execute(sql)
            conn.commit()

    except Exception as e:
        # 예외가 발생하면 롤백 수행
        print(f"Error: {e}")
        conn.rollback()

# insert_attribute_to_restaurant(attribute_for_restaurant)
# insert_attribute_to_location(attribute_for_location)
insert_attribute_to_category(attribute_for_category)
# insert_attribute_to_cnt(attribute_for_cnt)