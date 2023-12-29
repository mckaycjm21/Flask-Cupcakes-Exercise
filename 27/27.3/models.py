from flask_sqlalchemy import SQLAlchemy
import sqlalchemy as sa

db = SQLAlchemy()

def connect_db(app):
    db.app = app
    db.init_app(app)
    
def create_all_db(app):
    with app.app_context():
        db.create_all()
        
        
class Cupcake(db.Model):
    __tablename__ = 'cupcakes'
    
    def __repr__(self):
        p = self
        return f"<Cupcake id = {p.id} flavor = {p.flavor} size = {p.size} rating = {p.rating} image = {p.image}>"
    
    id = db.Column(db.Integer, 
                   primary_key = True,
                   autoincrement = True)
    
    flavor = db.Column(db.String,
                       nullable = False)
    
    size = db.Column(db.String,
                     nullable = False)
    
    rating = db.Column(db.Float,
                       nullable = False)
    
    image = db.Column(db.String,
                      default = 'https://tinyurl.com/demo-cupcake',
                      nullable = False
                    )
    
    def serialize(self):
        return {
                'id': self.id,
                'flavor': self.flavor,
                'size': self.size,
                'rating': self.rating,
                'image': self.image
                }