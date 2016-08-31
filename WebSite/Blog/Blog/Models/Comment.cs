using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Blog.Models
{
    public class Comment
    {   [Key]
        public int id { get; set; }

        public string body { get; set; }

        public Post PostId { get; set; }

        public string name { get; set; }
        
    }
}