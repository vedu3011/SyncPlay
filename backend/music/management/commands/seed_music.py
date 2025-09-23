# backend/music/management/commands/seed_music.py
from django.core.management.base import BaseCommand
from music.models import Artist, Genre

ARTISTS = [
    
    # === TOP INDIAN ARTISTS ===
    # Classic Bollywood Legends
    {"name": "Kishore Kumar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654344/kishore_kumar_i0v0ih.jpg"},
    {"name": "Lata Mangeshkar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654344/lata_mangeshkar_a0piuf.jpg"},
    {"name": "Mohammad Rafi", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654343/md_rafi_jkd3x2.jpg"},
    {"name": "Asha Bhosle", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/asha_bhosle_zeyluv.jpg"},
    {"name": "Mukesh", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654343/mukesh_dnx4p6.jpg"},
    {"name": "Geeta Dutt", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/geeta_dutt_hbvw7n.jpg"},
    {"name": "Hemant Kumar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/hemant_kumar_scpue9.jpg"},
    {"name": "Talat Mahmood", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/Talat_Mahmood_bko4vh.jpg"},
    
    # Golden Era Music Directors
    {"name": "R.D. Burman", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654340/RD_burman_hxfcim.jpg"},
    {"name": "S.D. Burman", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654341/SD_burman_m5t627.jpg"},
    {"name": "Shankar-Jaikishan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/Shankar-Jaikishan_rpjv0d.jpg"},
    {"name": "Laxmikant-Pyarelal", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/Laxmikant-Pyarelal_gwx5ha.jpg"},
    {"name": "O.P. Nayyar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654344/O.P_Nayyar_tmyc7k.jpg"},
    {"name": "Madan Mohan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758654342/Madan_Mohan_m8jhky.jpg"},
    
    # 90s-2000s Era
    {"name": "Kumar Sanu", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/Kumar_Sanu_uufjpc.jpg"},
    {"name": "Udit Narayan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/Udit_Narayan_ampyk4.jpg"},
    {"name": "Alka Yagnik", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/Alka_Yagnik_cumqao.jpg"},
    {"name": "Sonu Nigam", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/Sonu_Nigam_gbzypd.jpg"},
    {"name": "Abhijeet", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/Abhijeet_whyh4s.jpg"},
    {"name": "Kavita Krishnamurthy", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758656000/Kavita_Krishnamurthy_ct31hv.jpg"},
    
    # Modern Bollywood Playback Singers
    {"name": "Arijit Singh", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758656000/Arijit_Singh_ugpzo9.jpg"},
    {"name": "Shreya Ghoshal", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655999/Shreya_Ghoshal_k7vvck.jpg"},
    {"name": "Rahat Fateh Ali Khan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655999/Rahat_Fateh_Ali_Khan_ikben8.jpg"},
    {"name": "Armaan Malik", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655999/Armaan_Malik_lqbfui.jpg"},
    {"name": "Neha Kakkar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655999/Neha_Kakkar_waxnn9.jpg"},
    {"name": "Atif Aslam", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655999/Atif_Aslam_fgvai0.jpg"},
    {"name": "Sunidhi Chauhan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/Sunidhi_Chauhan_xlzyet.jpg"},
    {"name": "KK", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/KK_xkllvy.jpg"},
    
    # Indian Hip-Hop/Rap
    {"name": "Badshah", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/Badshah_rcttwd.jpg"},
    {"name": "DIVINE", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/DIVINE_xrcu79.jpg"},
    {"name": "Raftaar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/Raftaar_h84gcn.jpg"},
    {"name": "KSHMR", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655997/KSHMR_caisho.jpg"},
    {"name": "Nucleya", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758655998/Nucleya_auymxo.jpg"},
    
    # Punjabi Artists
    {"name": "AP Dhillon", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/AP_Dhillon_p8cftl.jpg"},
    {"name": "Sidhu Moose Wala", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/Sidhu_Moose_Wala_cxyewd.jpg"},
    {"name": "Diljit Dosanjh", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/Diljit_Dosanjh_bi2e0l.jpg"},
    {"name": "Karan Aujla", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758656999/Karan_Aujla_qagdhd.jpg"},
    {"name": "Gurnam Bhullar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657007/Gurnam_Bhullar_h89ohe.jpg"},
    {"name": "Ammy Virk", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657007/Ammy_Virk_f2yfij.jpg"},
    
    # Indian Pop/Independent
    {"name": "Prateek Kuhad", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657007/Prateek_Kuhad_jkmoq6.jpg"},
    {"name": "The Local Train", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657007/The_Local_Train_prsu2u.jpg"},
    {"name": "Ritviz", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657006/Ritviz_lxjgxt.jpg"},
    {"name": "Dualist Inquiry", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657006/Dualist_Inquiry_urixo9.jpg"},
    {"name": "When Chai Met Toast", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657006/When_Chai_Met_Toast_oezsss.jpg"},
    
    # Tamil/Regional
    {"name": "A.R. Rahman", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1756671851/a_r_rahman_qcdkbo.jpg"},
    {"name": "Anirudh Ravichander", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657006/Anirudh_Ravichander_mri2kf.jpg"},
    {"name": "Yuvan Shankar Raja", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657006/Yuvan_Shankar_Raja_en1vvz.jpg"},
    {"name": "Santhosh Narayanan", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657002/Santhosh_Narayanan_pa5jy6.jpg"},
    {"name": "Ilaiyaraaja", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657002/Ilaiyaraaja_pzjvzw.jpg"},
    
    # === TOP INTERNATIONAL ARTISTS ===
    # Pop Superstars
    {"name": "Taylor Swift", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Taylor_Swift_awbsvs.jpg"},
    {"name": "Ariana Grande", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Ariana_Grande_ulorzo.jpg"},
    {"name": "Ed Sheeran", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Ed_Sheeran_ykest6.jpg"},
    {"name": "Billie Eilish", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Billie_Eilish_dlx2ee.jpg"},
    {"name": "Dua Lipa", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Dua_Lipa_lyxpx4.jpg"},
    {"name": "Harry Styles", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657001/Harry_Styles_n2ynct.jpg"},
    {"name": "Olivia Rodrigo", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/Olivia_Rodrigo_uwtqwy.jpg"},
    {"name": "The Weeknd", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/The_Weeknd_nljh8t.jpg"},
    {"name": "Justin Bieber", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758656999/Justin_Bieber_f1lij8.jpg"},
    {"name": "Shawn Mendes", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758656999/Shawn_Mendes_sq6il0.jpg"},
    
    # Hip-Hop/Rap
    {"name": "Drake", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657933/Drake_dg1okf.jpg"},
    {"name": "Post Malone", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657933/Post_Malone_fd0ldh.jpg"},
    {"name": "Travis Scott", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657933/Travis_Scott_colbcm.jpg"},
    {"name": "Kendrick Lamar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657932/Kendrick_Lamar_lpjmy3.jpg"},
    {"name": "J. Cole", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657933/J.Cole_tvr7rn.jpg"},
    {"name": "Lil Baby", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657942/Lil_Baby_fcvlu8.jpg"},
    {"name": "DaBaby", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657942/DaBaby_aiagfb.jpg"},
    {"name": "Future", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657942/Future_xllz1g.jpg"},
    
    # R&B
    {"name": "Bad Bunny", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657941/BadBunny_fwzrss.jpg"},
    {"name": "SZA", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658258/SZA_wh0e70.jpg"},
    {"name": "The Weeknd", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657000/The_Weeknd_nljh8t.jpg"},
    {"name": "Frank Ocean", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657938/Frank_Ocean_aqgcgn.jpg"},
    {"name": "Daniel Caesar", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657939/Daniel_Caesar_wu951i.jpg"},
    
    # Electronic/EDM
    {"name": "Calvin Harris", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657940/Calvin_Harris_zphab4.jpg"},
    {"name": "David Guetta", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657938/David_Guetta_p5ibes.jpg"},
    {"name": "Martin Garrix", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657938/Martin_Garrix_ule3j3.jpg"},
    {"name": "Alan Walker", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657937/Alan_Walker_c9ougx.jpg"},
    {"name": "Swedish House Mafia", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657938/Swedish_House_Mafia_adradw.jpg"},
    {"name": "Marshmello", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657935/Marshmello_skwvzp.jpg"},
    
    # Rock/Alternative
    {"name": "Imagine Dragons", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657934/Imagine_Dragons_wk2kul.jpg"},
    {"name": "OneRepublic", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657934/Onerpublic_n0pocn.jpg"},
    {"name": "Coldplay", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657934/Coldplay_hkvuzm.jpg"},
    {"name": "Maroon 5", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657934/Maroon_5_vvwaqc.jpg"},
    {"name": "Twenty One Pilots", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657933/Twenty_One_Pilots_qm9rn0.jpg"},
    
    # K-Pop
    {"name": "BTS", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658917/BTS_sx3ty7.jpg"},
    {"name": "BLACKPINK", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658916/BLACKPINK_g079ak.jpg"},
    {"name": "TWICE", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658916/TWICE_asczvq.jpg"},
    {"name": "ITZY", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658916/ITZY_lvkqv9.jpg"},
    {"name": "NewJeans", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658916/NewJeans_pb9p6u.jpg"},
    {"name": "Stray Kids", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658937/Stray_Kids_cuohj1.jpg"},
    
    # Latin
    {"name": "Bad Bunny", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758657941/BadBunny_fwzrss.jpg"},
    {"name": "J Balvin", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658936/J_Balvin_lqwmpf.jpg"},
    {"name": "Karol G", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658934/Karol_G_tg0ls5.jpg"},
    {"name": "Ozuna", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658933/Ozuna_e8xqid.jpg"},
    {"name": "Maluma", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658932/Maluma_rhkfdp.jpg"},
    
    # Country
    {"name": "Morgan Wallen", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658931/Morgan_Wallen_qlxszz.jpg"},
    {"name": "Luke Combs", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658930/Luke_Combs_i6ukcx.jpg"},
    {"name": "Chris Stapleton", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658929/Chris_Stapleton_ccznyo.jpg"},
    {"name": "Kacey Musgraves", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658928/Kacey_Musgraves_deinrp.jpg"},
    
    # Classic Rock/Legends (Still Popular)
    {"name": "Queen", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658927/Queen_wqio0b.png"},
    {"name": "The Beatles", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658926/The_Beatles_iqpwx3.jpg"},
    {"name": "AC/DC", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658925/AC_DC_udz0lh.jpg"},
    {"name": "Led Zeppelin", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658924/Led_Zeppelin_qx0vt8.jpg"},
    {"name": "Pink Floyd", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658923/Pink_Floyd_f7jlzt.jpg"},
    
    # Jazz/Soul
    {"name": "John Mayer", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658922/John_Mayer_d7fdvp.jpg"},
    {"name": "Alicia Keys", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658921/Alicia_Keys_viybfv.jpg"},
    {"name": "Amy Winehouse", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658920/Amy_Winehouse_kg3q22.jpg"},
    {"name": "Adele", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758658919/Adele_leijg0.jpg"},
    
    # Indie/Alternative
    {"name": "Arctic Monkeys", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659213/Arctic_Monkeys_joemxi.jpg"},
    {"name": "Tame Impala", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659213/Tame_Impala_drkb2e.jpg"},
    {"name": "Lana Del Rey", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659565/Lana_Del_Rey_g3fiul.jpg"},
    {"name": "Mac Miller", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659864/Mac_Miller_bhtp0y.jpg"},
    {"name": "Tyler, The Creator", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659564/Tyler-The_Creator_bsookv.jpg"},
    
    # Reggae/Afrobeat
    {"name": "Bob Marley", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659626/Bob_Marley_c9ckke.jpg"},
    {"name": "Burna Boy", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659625/Burna_Boy_htgtop.jpg"},
    {"name": "Wizkid", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659625/Wizkid_d2cfiq.jpg"},
    {"name": "Davido", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659622/Davido_ex15qe.jpg"},
    
    # Additional Popular Artists
    {"name": "Bruno Mars", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659621/Bruno_Mars_nfe8pa.jpg"},
    {"name": "Rihanna", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659620/Rihanna_msrxbb.jpg"},
    {"name": "Lady Gaga", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659620/Lady_Gaga_t6urw1.jpg"},
    {"name": "Beyoncé", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659573/Beyonc%C3%A9_qdqzyt.jpg"},
    {"name": "Kanye West", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659572/Kanye_West_vdybs7.jpg"},
    {"name": "Eminem", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659571/Eminem_wximyn.jpg"},
    {"name": "Jay-Z", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659569/Jay-Z_qgqyaf.jpg"},
    {"name": "Sia", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659568/Sia_kfmpvs.jpg"},
    {"name": "Sam Smith", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659566/Sam_Smith_kd4l7l.jpg"},
    {"name": "Doja Cat", "image_url": "https://res.cloudinary.com/drbqgfk0q/image/upload/v1758659565/Doja_Cat_axcfv9.jpg"},
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
            Artist.objects.update_or_create(name=a["name"], defaults={"image_url": a["image_url"], "popularity": 50})
        for g in GENRES:
            Genre.objects.get_or_create(name=g)
        self.stdout.write(self.style.SUCCESS("Seeded artists and genres successfully"))
