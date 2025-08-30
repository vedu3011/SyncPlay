# backend/music/management/commands/seed_music.py
from django.core.management.base import BaseCommand
from music.models import Artist, Genre

ARTISTS = [
    
    # === TOP INDIAN ARTISTS ===
    # Classic Bollywood Legends
    {"name": "Kishore Kumar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Lata Mangeshkar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Mohammad Rafi", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Asha Bhosle", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Mukesh", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Geeta Dutt", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Hemant Kumar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Talat Mahmood", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Golden Era Music Directors
    {"name": "R.D. Burman", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "S.D. Burman", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Shankar-Jaikishan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Laxmikant-Pyarelal", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "O.P. Nayyar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Madan Mohan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # 90s-2000s Era
    {"name": "Kumar Sanu", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Udit Narayan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Alka Yagnik", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Sonu Nigam", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Abhijeet", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Kavita Krishnamurthy", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Modern Bollywood Playback Singers
    {"name": "Arijit Singh", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Shreya Ghoshal", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Rahat Fateh Ali Khan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Armaan Malik", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Neha Kakkar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Atif Aslam", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Sunidhi Chauhan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "KK", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Indian Hip-Hop/Rap
    {"name": "Badshah", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "DIVINE", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Raftaar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "KSHMR", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Nucleya", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Punjabi Artists
    {"name": "AP Dhillon", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Sidhu Moose Wala", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Diljit Dosanjh", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Karan Aujla", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Gurnam Bhullar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ammy Virk", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Indian Pop/Independent
    {"name": "Prateek Kuhad", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "The Local Train", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ritviz", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Dualist Inquiry", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "When Chai Met Toast", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Tamil/Regional
    {"name": "A.R. Rahman", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Anirudh Ravichander", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Yuvan Shankar Raja", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Santhosh Narayanan", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ilaiyaraaja", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # === TOP INTERNATIONAL ARTISTS ===
    # Pop Superstars
    {"name": "Taylor Swift", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ariana Grande", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ed Sheeran", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Billie Eilish", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Dua Lipa", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Harry Styles", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Olivia Rodrigo", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "The Weeknd", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Justin Bieber", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Shawn Mendes", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Hip-Hop/Rap
    {"name": "Drake", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Post Malone", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Travis Scott", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Kendrick Lamar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "J. Cole", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Lil Baby", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "DaBaby", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Future", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # R&B
    {"name": "Bad Bunny", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "SZA", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "The Weeknd", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Frank Ocean", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Daniel Caesar", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Electronic/EDM
    {"name": "Calvin Harris", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "David Guetta", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Martin Garrix", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Alan Walker", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Swedish House Mafia", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Marshmello", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Rock/Alternative
    {"name": "Imagine Dragons", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "OneRepublic", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Coldplay", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Maroon 5", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Twenty One Pilots", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # K-Pop
    {"name": "BTS", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "BLACKPINK", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "TWICE", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "ITZY", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "NewJeans", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Stray Kids", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Latin
    {"name": "Bad Bunny", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "J Balvin", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Karol G", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Ozuna", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Maluma", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Country
    {"name": "Morgan Wallen", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Luke Combs", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Chris Stapleton", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Kacey Musgraves", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Classic Rock/Legends (Still Popular)
    {"name": "Queen", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "The Beatles", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "AC/DC", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Led Zeppelin", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Pink Floyd", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Jazz/Soul
    {"name": "John Mayer", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Alicia Keys", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Amy Winehouse", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Adele", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Indie/Alternative
    {"name": "Arctic Monkeys", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Tame Impala", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Lana Del Rey", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Mac Miller", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Tyler, The Creator", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Reggae/Afrobeat
    {"name": "Bob Marley", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Burna Boy", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Wizkid", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Davido", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    
    # Additional Popular Artists
    {"name": "Bruno Mars", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Rihanna", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Lady Gaga", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Beyoncé", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Kanye West", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Eminem", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Jay-Z", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Sia", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Sam Smith", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
    {"name": "Doja Cat", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},
]


GENRES = [
    "Pop",
    "Hip Hop",
    "Rock", 
    "EDM",
    "R&B",
    "Country",
    "Indie",
    "Alternative",
    
    # === MOOD-BASED GENRES ===
    "Lo-fi",
    "Chill",
    "Study Music",
    "Workout",
    "Party",
    "Romance",
    "Sad Songs",
    "Motivational",
    
    # === INDIAN/REGIONAL ===
    "Bollywood",
    "Punjabi", 
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Devotional",
    "Ghazals",
    "Qawwali",
    
    # === ELECTRONIC/DANCE ===
    "House",
    "Techno",
    "Dubstep",
    "Trance",
    "Progressive House",
    "Future Bass",
    "Trap",
    
    # === CLASSIC GENRES ===
    "Jazz",
    "Blues",
    "Classical",
    "Folk",
    "Reggae",
    "Funk",
    "Soul",
    "Disco",
    
    # === MODERN TRENDING ===
    "K-Pop",
    "Latin Pop",
    "Reggaeton",
    "Afrobeats",
    "Drill",
    "Phonk",
    "Synthwave",
    "Vaporwave",
    
    # === ROCK SUBGENRES ===
    "Alternative Rock",
    "Indie Rock", 
    "Pop Rock",
    "Hard Rock",
    "Punk Rock",
    "Metal",
    
    # === HIP-HOP SUBGENRES ===
    "Rap",
    "Old School Hip Hop",
    "Conscious Hip Hop",
    "Mumble Rap",
    "Boom Bap",
    
    # === CHILL/AMBIENT ===
    "Acoustic",
    "Instrumental",
    "Ambient",
    "New Age",
    "Meditation",
    "Nature Sounds",
    
    # === GLOBAL MUSIC ===
    "World Music",
    "Latin",
    "Arabic",
    "Turkish",
    "Japanese",
    "Chinese",
    
    # === ACTIVITY-BASED ===
    "Gaming Music",
    "Driving Music",
    "Sleep Music",
    "Focus Music",
    "Cooking Music",
    "Road Trip",
    
    # === NOSTALGIC/RETRO ===
    "80s",
    "90s",
    "2000s",
    "Retro",
    "Oldies",
    "Classic Rock",
    
    # === NICHE BUT POPULAR ===
    "Podcast",
    "Stand-up Comedy",
    "Audiobooks",
    "Nature & Wildlife",
    "ASMR",
    
    # === SEASONAL/OCCASION ===
    "Christmas",
    "Summer Hits",
    "Monsoon",
    "Festival Songs",
    "Wedding Songs",
    "Birthday Party"
]
class Command(BaseCommand):
    help = "Seed initial artists and genres"

    def handle(self, *args, **options):
        for a in ARTISTS:
            Artist.objects.get_or_create(name=a["name"], defaults={"image_url": a["image_url"], "popularity": 50})
        for g in GENRES:
            Genre.objects.get_or_create(name=g)
        self.stdout.write(self.style.SUCCESS("Seeded artists and genres successfully"))
